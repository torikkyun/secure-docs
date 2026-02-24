// import { useForm } from '@tanstack/react-form'
// // import { changePasswordFn } from '../functions'
// // import { changePasswordSchema } from '../schemas'
// import FieldInfo from '@/components/field-info'

// export function ChangePasswordForm() {
//   const form = useForm({
//     defaultValues: {
//       currentPassword: '',
//       newPassword: '',
//       confirmPassword: '',
//     },
//     validators: {
//       onChange: changePasswordSchema,
//     },
//     onSubmit: async ({ value }) => {
//       await changePasswordFn({ data: value })
//       alert('Đổi mật khẩu thành công!')
//       form.reset()
//     },
//   })

//   return (
//     <form
//       onSubmit={(e) => {
//         e.preventDefault()
//         e.stopPropagation()
//         form.handleSubmit()
//       }}
//       style={{
//         border: '1px solid #ddd',
//         borderRadius: '8px',
//         padding: '20px',
//         marginBottom: '20px',
//       }}
//     >
//       <h3 style={{ marginTop: 0 }}>Đổi mật khẩu</h3>

//       <form.Field
//         name="currentPassword"
//         children={(field) => (
//           <div style={{ marginBottom: '15px' }}>
//             <label
//               htmlFor={field.name}
//               style={{ display: 'block', marginBottom: '5px' }}
//             >
//               <strong>Mật khẩu hiện tại:</strong>
//             </label>
//             <input
//               id={field.name}
//               name={field.name}
//               type="password"
//               value={field.state.value}
//               onChange={(e) => field.handleChange(e.target.value)}
//               onBlur={field.handleBlur}
//               placeholder="Nhập mật khẩu hiện tại..."
//               style={{
//                 width: '100%',
//                 padding: '10px',
//                 borderRadius: '4px',
//                 border: '1px solid #ccc',
//               }}
//             />
//             <FieldInfo field={field} />
//           </div>
//         )}
//       />

//       <form.Field
//         name="newPassword"
//         children={(field) => (
//           <div style={{ marginBottom: '15px' }}>
//             <label
//               htmlFor={field.name}
//               style={{ display: 'block', marginBottom: '5px' }}
//             >
//               <strong>Mật khẩu mới:</strong>
//             </label>
//             <input
//               id={field.name}
//               name={field.name}
//               type="password"
//               value={field.state.value}
//               onChange={(e) => field.handleChange(e.target.value)}
//               onBlur={field.handleBlur}
//               placeholder="Nhập mật khẩu mới (tối thiểu 8 ký tự)..."
//               style={{
//                 width: '100%',
//                 padding: '10px',
//                 borderRadius: '4px',
//                 border: '1px solid #ccc',
//               }}
//             />
//             <FieldInfo field={field} />
//           </div>
//         )}
//       />

//       <form.Field
//         name="confirmPassword"
//         children={(field) => (
//           <div style={{ marginBottom: '15px' }}>
//             <label
//               htmlFor={field.name}
//               style={{ display: 'block', marginBottom: '5px' }}
//             >
//               <strong>Xác nhận mật khẩu mới:</strong>
//             </label>
//             <input
//               id={field.name}
//               name={field.name}
//               type="password"
//               value={field.state.value}
//               onChange={(e) => field.handleChange(e.target.value)}
//               onBlur={field.handleBlur}
//               placeholder="Nhập lại mật khẩu mới..."
//               style={{
//                 width: '100%',
//                 padding: '10px',
//                 borderRadius: '4px',
//                 border: '1px solid #ccc',
//               }}
//             />
//             <FieldInfo field={field} />
//           </div>
//         )}
//       />

//       <form.Subscribe
//         selector={(state) => [state.canSubmit, state.isSubmitting]}
//         children={([canSubmit, isSubmitting]) => (
//           <button
//             type="submit"
//             disabled={!canSubmit || isSubmitting}
//             style={{
//               padding: '10px 20px',
//               backgroundColor: !canSubmit || isSubmitting ? '#ccc' : '#28a745',
//               color: 'white',
//               border: 'none',
//               borderRadius: '4px',
//               cursor: !canSubmit || isSubmitting ? 'not-allowed' : 'pointer',
//             }}
//           >
//             {isSubmitting ? 'Đang đổi...' : 'Đổi mật khẩu'}
//           </button>
//         )}
//       />
//     </form>
//   )
// }
