use aes_gcm::{
    aead::{Aead, AeadCore, KeyInit, OsRng},
    Aes256Gcm, Key, Nonce,
};
use hkdf::Hkdf;
use sha2::{Digest, Sha256};
use std::path::{Path, PathBuf};
use tauri::{AppHandle, Emitter, Manager};

/// 4-byte magic header identifying a SecureDocs encrypted file.
const MAGIC: &[u8; 4] = b"SDOC";
/// Name of the secure download folder placed in the user's Documents directory.
const SECURE_FOLDER_NAME: &str = "SecureDocs";

/// Metadata returned for each .sdoc file in the secure folder.
#[derive(serde::Serialize)]
pub struct SecureFileEntry {
    /// Absolute path to the .sdoc file on disk.
    path: String,
    /// Original filename (the part before .sdoc).
    display_name: String,
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

/// Load or generate the per-install 32-byte master secret stored in
/// the app's local data directory. The secret never leaves the machine.
fn get_master_secret(app: &AppHandle) -> Result<[u8; 32], String> {
    let data_dir = app
        .path()
        .app_local_data_dir()
        .map_err(|e| format!("Không thể lấy app data dir: {e}"))?;

    std::fs::create_dir_all(&data_dir)
        .map_err(|e| format!("Không thể tạo thư mục dữ liệu: {e}"))?;

    let secret_path = data_dir.join("app.secret");
    if secret_path.exists() {
        let bytes =
            std::fs::read(&secret_path).map_err(|e| format!("Không thể đọc secret: {e}"))?;
        if bytes.len() == 32 {
            let mut secret = [0u8; 32];
            secret.copy_from_slice(&bytes);
            return Ok(secret);
        }
    }

    // Generate a fresh 32-byte master secret.
    let key = Aes256Gcm::generate_key(OsRng);
    std::fs::write(&secret_path, key.as_slice())
        .map_err(|e| format!("Không thể lưu secret: {e}"))?;

    let mut secret = [0u8; 32];
    secret.copy_from_slice(key.as_slice());
    Ok(secret)
}

/// Resolve (and create) the secure download folder at Documents/SecureDocs.
fn get_secure_folder_path_internal(app: &AppHandle) -> Result<PathBuf, String> {
    let doc_dir = app
        .path()
        .document_dir()
        .map_err(|e| format!("Không thể lấy thư mục Documents: {e}"))?;

    let secure_folder = doc_dir.join(SECURE_FOLDER_NAME);
    std::fs::create_dir_all(&secure_folder)
        .map_err(|e| format!("Không thể tạo thư mục bảo mật: {e}"))?;

    Ok(secure_folder)
}

/// Derive a 32-byte file encryption key bound to the given folder identity.
fn derive_file_key(master_secret: &[u8], folder_id: &[u8; 32]) -> [u8; 32] {
    let hk = Hkdf::<Sha256>::new(Some(folder_id), master_secret);
    let mut okm = [0u8; 32];
    hk.expand(b"secure-docs-file-key-v1", &mut okm)
        .expect("HKDF expand failed");
    okm
}

/// Compute a stable 32-byte identifier for a folder path.
/// Paths are normalised to forward slashes and lowercased so the id is
/// consistent on case-insensitive file systems (Windows).
fn compute_folder_id(folder_path: &Path) -> [u8; 32] {
    let path_str = folder_path
        .to_string_lossy()
        .replace('\\', "/")
        .to_lowercase();
    let hash = Sha256::digest(path_str.as_bytes());
    let mut id = [0u8; 32];
    id.copy_from_slice(&hash);
    id
}

/// Remove characters that could be used for path traversal or are illegal in
/// filenames on common operating systems.
fn sanitize_filename(name: &str) -> String {
    name.chars()
        .filter(|c| {
            !matches!(
                c,
                '/' | '\\' | '\0' | ':' | '*' | '?' | '"' | '<' | '>' | '|'
            )
        })
        .collect()
}

// ─── Tauri commands ───────────────────────────────────────────────────────────

/// Return the absolute path of the secure download folder.
/// The folder is created automatically if it does not yet exist.
#[tauri::command]
fn get_secure_folder(app: AppHandle) -> Result<String, String> {
    let folder = get_secure_folder_path_internal(&app)?;
    Ok(folder.to_string_lossy().into_owned())
}

/// Re-encrypt already-decrypted file bytes with a folder-bound AES-256-GCM key
/// and write them to the secure folder as `<filename>.sdoc`.
///
/// File layout on disk:
///   [MAGIC 4 B][folder_id 32 B][AES-GCM nonce 12 B][ciphertext + GCM tag]
///
/// Returns the absolute path of the saved file.
#[tauri::command]
fn save_secure_file(
    app: AppHandle,
    filename: String,
    decrypted_bytes: Vec<u8>,
) -> Result<String, String> {
    let master_secret = get_master_secret(&app)?;
    let secure_folder = get_secure_folder_path_internal(&app)?;

    // Use the canonical path so folder_id is stable even when the raw path
    // contains symlinks or redundant separators.
    let canonical_folder =
        std::fs::canonicalize(&secure_folder).unwrap_or_else(|_| secure_folder.clone());
    let folder_id = compute_folder_id(&canonical_folder);
    let file_key = derive_file_key(&master_secret, &folder_id);

    let cipher = Aes256Gcm::new(Key::<Aes256Gcm>::from_slice(&file_key));
    let nonce = Aes256Gcm::generate_nonce(&mut OsRng);
    let ciphertext = cipher
        .encrypt(&nonce, decrypted_bytes.as_ref())
        .map_err(|e| format!("Mã hóa thất bại: {e}"))?;

    // Assemble the .sdoc container.
    let mut file_data: Vec<u8> = Vec::with_capacity(4 + 32 + 12 + ciphertext.len());
    file_data.extend_from_slice(MAGIC);
    file_data.extend_from_slice(&folder_id);
    file_data.extend_from_slice(nonce.as_slice());
    file_data.extend_from_slice(&ciphertext);

    let safe_name = sanitize_filename(&filename);
    let save_path = secure_folder.join(format!("{safe_name}.sdoc"));

    std::fs::write(&save_path, &file_data).map_err(|e| format!("Không thể lưu file: {e}"))?;

    Ok(save_path.to_string_lossy().into_owned())
}

/// Decrypt a `.sdoc` file and return its raw bytes.
///
/// Security guarantees enforced before decryption:
/// 1. The file's **real** canonical path (resolved by the OS) must be inside
///    the secure folder — moving the file out makes this check fail.
/// 2. The `folder_id` embedded in the file header must match the current
///    secure folder — files cannot be re-targeted to a different folder.
#[tauri::command]
fn open_secure_file(app: AppHandle, file_path: String) -> Result<Vec<u8>, String> {
    // Step 1 – resolve the real canonical path; rejects symlink tricks.
    let canonical_path = std::fs::canonicalize(&file_path)
        .map_err(|_| "Không tìm thấy file hoặc đường dẫn không hợp lệ.".to_string())?;

    // Step 2 – the file must reside inside the secure folder.
    let secure_folder = get_secure_folder_path_internal(&app)?;
    let canonical_secure_folder =
        std::fs::canonicalize(&secure_folder).unwrap_or_else(|_| secure_folder.clone());

    if !canonical_path.starts_with(&canonical_secure_folder) {
        return Err(
            "Không thể mở file: file không nằm trong thư mục bảo mật (SecureDocs). \
             Vui lòng đặt file trở lại đúng thư mục."
                .to_string(),
        );
    }

    // Step 3 – read and validate the container.
    let file_data =
        std::fs::read(&canonical_path).map_err(|e| format!("Không thể đọc file: {e}"))?;

    // Minimum: MAGIC(4) + folder_id(32) + nonce(12) + GCM-tag(16) = 64 bytes
    if file_data.len() < 64 {
        return Err("File không hợp lệ hoặc bị hỏng.".to_string());
    }
    if &file_data[..4] != MAGIC {
        return Err("File này không phải định dạng SecureDocs (.sdoc).".to_string());
    }

    let stored_folder_id: [u8; 32] = file_data[4..36].try_into().unwrap();
    let nonce_bytes: &[u8] = &file_data[36..48];
    let ciphertext = &file_data[48..];

    // Step 4 – folder_id must match; prevents re-targeting to another folder.
    let expected_folder_id = compute_folder_id(&canonical_secure_folder);
    if stored_folder_id != expected_folder_id {
        return Err("File không được mã hóa cho thư mục này. Không thể mở.".to_string());
    }

    // Step 5 – derive key and decrypt.
    let master_secret = get_master_secret(&app)?;
    let file_key = derive_file_key(&master_secret, &stored_folder_id);
    let cipher = Aes256Gcm::new(Key::<Aes256Gcm>::from_slice(&file_key));
    let nonce = Nonce::from_slice(nonce_bytes);

    cipher
        .decrypt(nonce, ciphertext)
        .map_err(|_| "Giải mã thất bại – file có thể bị chỉnh sửa hoặc hỏng.".to_string())
}

/// List all .sdoc files currently inside the secure folder.
#[tauri::command]
fn list_secure_files(app: AppHandle) -> Result<Vec<SecureFileEntry>, String> {
    let secure_folder = get_secure_folder_path_internal(&app)?;

    let read_dir = std::fs::read_dir(&secure_folder)
        .map_err(|e| format!("Không thể đọc thư mục SecureDocs: {e}"))?;

    let mut files: Vec<SecureFileEntry> = read_dir
        .flatten()
        .filter_map(|entry| {
            let path = entry.path();
            if path.extension().and_then(|e| e.to_str()) == Some("sdoc") {
                let display_name = path
                    .file_stem()
                    .and_then(|s| s.to_str())
                    .unwrap_or("unknown")
                    .to_string();
                Some(SecureFileEntry {
                    path: path.to_string_lossy().into_owned(),
                    display_name,
                })
            } else {
                None
            }
        })
        .collect();

    // Sort alphabetically by display name for a stable list order.
    files.sort_by(|a, b| {
        a.display_name
            .to_lowercase()
            .cmp(&b.display_name.to_lowercase())
    });

    Ok(files)
}

// ─── App bootstrap ────────────────────────────────────────────────────────────

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }

            // Handle file association: if launched with a .sdoc path argument,
            // emit the event after a short delay to ensure the webview is ready.
            let args: Vec<String> = std::env::args().collect();
            if let Some(path) = args.get(1) {
                if path.ends_with(".sdoc") {
                    let handle = app.handle().clone();
                    let path = path.clone();
                    std::thread::spawn(move || {
                        std::thread::sleep(std::time::Duration::from_millis(800));
                        let _ = handle.emit("open-secure-file", &path);
                    });
                }
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_secure_folder,
            save_secure_file,
            open_secure_file,
            list_secure_files,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
