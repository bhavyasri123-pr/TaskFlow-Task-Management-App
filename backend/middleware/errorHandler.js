export const errorHandler = (err, req, res, next) => {
  console.error("Error:", err.message || err);

  if (err?.name === "ZodError" || Array.isArray(err?.issues)) {
    const issues = err.issues || [];
    return res.status(400).json({
      success: false,
      message: issues[0]?.message || "Invalid input",
      errors: issues,
    });
  }

  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

  return res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err : undefined,
  });
};
