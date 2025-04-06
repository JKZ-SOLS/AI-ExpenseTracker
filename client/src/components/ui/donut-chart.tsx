import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

export interface DonutChartData {
  name: string;
  value: number;
  color: string;
  percentage?: number;
}

interface DonutChartProps {
  data: DonutChartData[];
  innerLabel?: React.ReactNode;
  showLegend?: boolean;
  showTooltip?: boolean;
  height?: number;
  width?: number;
}

export const DonutChart = ({
  data,
  innerLabel,
  showLegend = false,
  showTooltip = true,
  height = 200,
  width = 200
}: DonutChartProps) => {
  return (
    <div className="relative" style={{ height: `${height}px`, width: `${width}px` }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={width * 0.3}
            outerRadius={width * 0.45}
            fill="#8884d8"
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          {showLegend && (
            <Legend 
              iconType="circle" 
              layout="vertical" 
              verticalAlign="middle" 
              align="right"
            />
          )}
          {showTooltip && <Tooltip />}
        </PieChart>
      </ResponsiveContainer>
      {innerLabel && (
        <div className="absolute inset-0 flex items-center justify-center flex-col">
          {innerLabel}
        </div>
      )}
    </div>
  );
};
