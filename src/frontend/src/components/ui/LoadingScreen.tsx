import { motion } from "motion/react";

export function LoadingScreen() {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ backgroundColor: "#0a0a0a" }}
    >
      {/* Logo mark */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="mb-8 flex flex-col items-center gap-4"
      >
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl glass-strong shadow-glow">
          <span className="font-display text-2xl font-bold text-primary">
            W
          </span>
          <div className="absolute inset-0 rounded-2xl animate-pulse bg-primary/10" />
        </div>
        <div className="text-center">
          <h1
            className="font-display text-xl font-bold tracking-tight"
            style={{ color: "#ffffff" }}
          >
            WealthPulse
          </h1>
          <p
            className="mt-1 text-sm"
            style={{ color: "rgba(255,255,255,0.45)" }}
          >
            Connecting securely…
          </p>
        </div>
      </motion.div>

      {/* Spinner */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex gap-1.5"
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="h-2 w-2 rounded-full bg-primary"
            animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }}
            transition={{
              duration: 1.2,
              repeat: Number.POSITIVE_INFINITY,
              delay: i * 0.2,
            }}
          />
        ))}
      </motion.div>
    </div>
  );
}
