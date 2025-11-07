export default function SummaryCard({ symbol, sentiment }) {
  const sentimentClass =
    sentiment > 0.1
      ? "text-success"
      : sentiment < -0.1
        ? "text-error"
        : "text-warning";

  return (
    <div className="card shadow-lg border border-primary/40 bg-linear-to-r from-primary/10 to-secondary/10 mb-6">
      <div className="card-body text-center">
        <h2 className="text-2xl font-bold text-primary">{symbol}</h2>
        <p className="text-lg text-base-content/70">Average Sentiment</p>
        <p className={`text-4xl font-bold ${sentimentClass}`}>{sentiment}</p>
      </div>
    </div>
  );
}
