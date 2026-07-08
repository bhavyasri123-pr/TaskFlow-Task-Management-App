import "../styles/loader.css";

function Loader({ text = "Loading...", compact = false }) {
  return (
    <div className={compact ? "loader-inline" : "loader-page"}>
      <span className="loader-spinner" />
      <span>{text}</span>
    </div>
  );
}

export default Loader;
