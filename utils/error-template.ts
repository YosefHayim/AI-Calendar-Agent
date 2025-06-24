const throwHttpError = (message: string, status: number): never => {
  const error = new Error(message);
  (error as any).status = status;
  throw error;
};

export default throwHttpError;
