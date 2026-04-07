export class BlockchainLogShareEvent {
  constructor(
    public readonly activityId: string,
    public readonly fileId: string,
    public readonly senderId: string,
    public readonly recipientIds: string[],
    public readonly timestamp: number,
    public readonly expiresAt: number, // Unix timestamp in seconds, 0 = no expiry
  ) {}
}

export class BlockchainLogDownloadEvent {
  constructor(
    public readonly activityId: string,
    public readonly fileId: string,
    public readonly recipientId: string,
    public readonly timestamp: number,
  ) {}
}

export class BlockchainLogViewEvent {
  constructor(
    public readonly activityId: string,
    public readonly fileId: string,
    public readonly viewerId: string,
    public readonly timestamp: number,
  ) {}
}
