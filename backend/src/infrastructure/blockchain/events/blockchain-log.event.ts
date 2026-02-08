export class BlockchainLogShareEvent {
  constructor(
    public readonly activityId: string,
    public readonly fileId: string,
    public readonly senderId: string,
    public readonly recipientIds: string[],
    public readonly timestamp: number,
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
