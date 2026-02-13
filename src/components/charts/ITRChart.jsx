import {
    Chart as ChartJS,
    BarElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
    BarElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend
);

const COLORS = [
    '#a0d1ff', '#ff9777', '#c0ff78', '#ffcc56', '#9b59b6',
    '#1abc9c', '#e74c3c', '#3498db', '#f39c12', '#2ecc71',
    '#e67e22', '#8e44ad', '#16a085', '#d35400', '#2980b9',
    '#27ae60', '#c0392b', '#7f8c8d', '#f1c40f', '#00bcd4',
    '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7'
];

export default function ITRChart({ employeeStatusData, itrStatuses }) {

    // Y-axis labels
    const labels = itrStatuses.map((s) => s.label);

    // Get all employee names
    const allEmployees = Object.keys(employeeStatusData);

    // Filter out employees with 0 total records
    const activeEmployees = allEmployees.filter((emp) => {
        const total = labels.reduce((sum, status) => {
            return sum + (employeeStatusData[emp][status] || 0);
        }, 0);
        return total > 0;
    });

    // Build one dataset per active employee
    const datasets = activeEmployees.map((empName, index) => {
        const data = labels.map((statusLabel) => {
            return employeeStatusData[empName][statusLabel] || 0;
        });

        return {
            label: empName,
            data: data,
            backgroundColor: COLORS[index % COLORS.length],
            borderRadius: 3,
            barThickness: 18
        };
    });

    const chartData = {
        labels,
        datasets
    };

    const options = {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    padding: 15,
                    usePointStyle: true,
                    pointStyle: 'rect',
                    font: { size: 12 }
                }
            },
            tooltip: {
                callbacks: {
                    label: (context) => {
                        const employee = context.dataset.label;
                        const count = context.raw;
                        return ` ${employee}: ${count} record${count !== 1 ? 's' : ''}`;
                    },
                    afterBody: (tooltipItems) => {
                        const statusIndex = tooltipItems[0].dataIndex;
                        const total = datasets.reduce((sum, ds) => {
                            return sum + (ds.data[statusIndex] || 0);
                        }, 0);
                        return `\n  Total: ${total}`;
                    }
                }
            }
        },
        scales: {
            x: {
                stacked: true,
                title: {
                    display: true,
                    text: 'Number of Records',
                    font: { size: 13, weight: 'bold' }
                },
                grid: { color: 'rgba(0,0,0,0.05)' }
            },
            y: {
                stacked: true,
                ticks: {
                    font: { size: 11 },
                    callback: function (value) {
                        const label = this.getLabelForValue(value);
                        return label.length > 30
                            ? label.substring(0, 30) + '...'
                            : label;
                    }
                },
                grid: { display: false }
            }
        }
    };

    // Empty state
    if (activeEmployees.length === 0) {
        return (
            <div className="d-flex justify-content-center align-items-center h-100">
                <p className="text-muted">No ITR data available for any employee</p>
            </div>
        );
    }

    return (
        <div style={{ height: '700px', width: '100%' }}>

            {/* Employee Summary Badges */}
            <div className="mb-3 d-flex gap-2 flex-wrap">
                {activeEmployees.map((emp, i) => {
                    const total = labels.reduce((sum, status) => {
                        return sum + (employeeStatusData[emp][status] || 0);
                    }, 0);
                    return (
                        <span
                            key={emp}
                            className="badge p-2"
                            style={{
                                backgroundColor: COLORS[i % COLORS.length],
                                color: '#333',
                                fontSize: '12px'
                            }}
                        >
                            {emp}: {total} total
                        </span>
                    );
                })}
            </div>

            {/* Chart */}
            <Bar data={chartData} options={options} />
        </div>
    );
}