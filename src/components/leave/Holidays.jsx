import {useEffect,useState} from 'react'
import { getDayName } from '../../utils/dateUtils';
import '../../css/zentable.css';
import '../../css/holidays.css';

const MONTHS = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];

// Date_field ARRIVES AS MM-DD-YYYY
const parseDate = (value = "") => {
  const [month, day, year] = value.split("-").map(Number);
  if (!month || !day || !year) return null;
  return new Date(year, month - 1, day);
};

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

const daysUntil = (date) => Math.round((date - startOfToday()) / 86400000);

const Holidays = () => {

    const [holidays, setHolidays] = useState([]);
    const [loaded, setLoaded] = useState(false);

      useEffect(() => {
        const fetchLeaves = async () => {
          try {
            const res = await ZOHO.CREATOR.DATA.getRecords({report_name: "Office_Holiday__List", criteria: `Even_Type == "Holiday"`})

            console.log(res)

            if(res.code == 3000){
                setHolidays(res.data || []);
            }

          } catch (err) {
            console.error(err);
          } finally {
            setLoaded(true);
          }
        };

        fetchLeaves();
      }, []);

  // THE REPORT DOES NOT GUARANTEE ORDER, AND A HOLIDAY LIST OUT OF
  // CHRONOLOGICAL ORDER IS UNREADABLE — SORT BEFORE RENDERING
  const items = holidays
    .map((e) => {
      const date = parseDate(e?.Date_field);
      return { id: e.ID, name: e?.Event_Name, raw: e?.Date_field, date };
    })
    .filter((item) => item.date)
    .sort((a, b) => a.date - b.date);

  const today = startOfToday();

  // FIRST ONE THAT HAS NOT PASSED — HIGHLIGHTED AS "NEXT"
  const nextIndex = items.findIndex((item) => item.date >= today);

  const upcomingCount = nextIndex === -1 ? 0 : items.length - nextIndex;

  return (
    <div className="mt-3">
      <div className="zen-card">

        <div className="zen-card__head">
          <h5 className="zen-card__title">Holidays</h5>

          {upcomingCount > 0 && (
            <span className="count-pill count-pill--violet">{upcomingCount} upcoming</span>
          )}

          {items.length > 0 && (
            <span className="zen-legend__item ms-auto">
              {items.length} in total
            </span>
          )}
        </div>

        <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 row-cols-xxl-4 g-3">
          {items.map((item, index) => {

            const isPast = item.date < today;
            const isNext = index === nextIndex;
            const away = daysUntil(item.date);

            return (
              <div className="col" key={item.id}>
                <div className={`hol-tile ${isPast ? "is-past" : ""} ${isNext ? "is-next" : ""}`}>

                  {isNext && <span className="hol-flag">Next</span>}

                  <div className="hol-date">
                    <span className="hol-date__day">
                      {String(item.date.getDate()).padStart(2, "0")}
                    </span>
                    <span className="hol-date__mon">
                      {MONTHS[item.date.getMonth()]}
                    </span>
                  </div>

                  <div className="hol-info">
                    <div className="hol-info__name">{item.name || "Holiday"}</div>
                    <div className="hol-info__meta">
                      {getDayName(item.raw)}
                      {isNext && (away === 0 ? " · Today" : ` · in ${away} day${away === 1 ? "" : "s"}`)}
                      {!isNext && ` · ${item.date.getFullYear()}`}
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>

        {loaded && items.length === 0 && (
          <div className="zen-empty">
            <i className="bi bi-calendar2-week zen-empty__icon"></i>
            No holidays published yet.
          </div>
        )}

      </div>
    </div>
  )
}

export default Holidays
