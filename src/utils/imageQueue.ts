type QueueItem = {
  url: string;
  resolve: () => void;
  reject: () => void;
};

class ImageQueue {
  private queue: QueueItem[] = [];
  private isProcessing = false;
  private cache = new Set<string>();

  public load(url: string): Promise<void> {
    // Если уже загружено, сразу отдаем успех
    if (this.cache.has(url)) return Promise.resolve();

    return new Promise((resolve, reject) => {
      this.queue.push({ url, resolve, reject });
      this.processNext();
    });
  }

  private async processNext() {
    if (this.isProcessing || this.queue.length === 0) return;
    
    this.isProcessing = true;
    const item = this.queue.shift();
    
    if (!item) {
      this.isProcessing = false;
      return;
    }

    const img = new Image();
    
    img.onload = () => {
      this.cache.add(item.url);
      item.resolve();
      this.isProcessing = false;
      // Небольшая задержка между запросами, чтобы не спамить прокси
      setTimeout(() => this.processNext(), 150);
    };

    img.onerror = () => {
      item.reject();
      this.isProcessing = false;
      setTimeout(() => this.processNext(), 150);
    };
    
    img.src = item.url;
  }
}

export const imageQueue = new ImageQueue();