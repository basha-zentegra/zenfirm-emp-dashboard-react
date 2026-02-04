import { useEffect, useState } from "react";

function Transactions() {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const username = "pravepaul@gmail.com";
    const password = "Admin@123";
    const token = btoa(`${username}:${password}`);

    fetch(
      "https://zentegra.itimedev.minervaiot.com/iclock/api/transactions/?start_time=2026-02-02&ordering=punch_time&page_size=10000",
      {
        headers: {
          Authorization: `Basic ${token}`,
        },
      }
    )
      .then(res => res.json())
      .then(setData)
      .catch(setError);
  }, []);

  return (
    <div>
      <h2>Transactions</h2>
      {error && <p>Error loading data</p>}
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}

export default Transactions;
