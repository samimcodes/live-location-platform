export const catchServiceAsync = <T extends (...args: any[]) => Promise<any>>(
  fn: T
): T => {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      // এখানে আপনি চাইলে সার্ভিসের এররগুলো লগ করে রাখতে পারেন বা কাস্টমাইজ করতে পারেন
      console.error('Service Layer Error:', error);
      throw error; // Controller-এর catchAsync যেন এটাকে ধরতে পারে তাই থ্রো করা হলো
    }
  }) as T;
};
