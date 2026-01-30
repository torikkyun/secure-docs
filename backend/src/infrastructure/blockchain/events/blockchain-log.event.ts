/**
 * Event emitted when a file share needs to be logged on blockchain
 * This event is processed asynchronously without blocking the main request
 */
export class BlockchainLogShareEvent {
  constructor(
    public readonly activityId: string,
    public readonly fileId: string,
    public readonly senderId: string,
    public readonly recipientIds: string[],
    public readonly timestamp: number,
  ) {}
}

/**
 * Event emitted when a file download needs to be logged on blockchain
 * This event is processed asynchronously without blocking the main request
 */
export class BlockchainLogDownloadEvent {
  constructor(
    public readonly activityId: string,
    public readonly fileId: string,
    public readonly recipientId: string,
    public readonly timestamp: number,
  ) {}
}
