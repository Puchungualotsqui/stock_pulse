export default function ArticleList({ articles = [] }) {
  if (!Array.isArray(articles) || articles.length === 0) {
    return (
      <div className="alert alert-info shadow-sm mt-4 text-center">
        <span>No related news available.</span>
      </div>
    );
  }

  return (
    <>
      <div className="divider font-semibold text-base-content/70">
        Related News
      </div>

      {articles.map((a, i) => (
        <a
          key={i}
          href={a.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block card bg-base-100 shadow-md hover:shadow-lg transition hover:scale-[1.01] cursor-pointer"
        >
          <div className="card-body py-4 px-5">
            <h3 className="font-semibold text-base-content mb-1">{a.title}</h3>
            <p
              className={`font-medium ${
                a.sentiment === "positive"
                  ? "text-success"
                  : a.sentiment === "negative"
                    ? "text-error"
                    : "text-warning"
              }`}
            >
              {a.sentiment}
            </p>
          </div>
        </a>
      ))}
    </>
  );
}
