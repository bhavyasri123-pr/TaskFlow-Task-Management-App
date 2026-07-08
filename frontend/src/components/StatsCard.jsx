import "../styles/statscard.css";

function StatsCard({
  title,
  value,
  icon,
  color
}) {

  return (

    <div className="stats-card">

      <div>

        <h4>{title}</h4>

        <h2>{value}</h2>

      </div>

      <div
        className="stats-icon"
        style={{ background: color }}
      >

        {icon}

      </div>

    </div>

  );

}

export default StatsCard;