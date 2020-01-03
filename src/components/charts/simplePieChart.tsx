import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, LabelList, LabelProps, PolarViewBox } from "recharts";
import { useMemo } from "react";

const DEFAULT_COLORS = ["#003f5c", "#7a5195", "#ef5675", "#ffa600"];

const getDeltaAngle = (startAngle: number, endAngle: number) => {
  const sign = Math.sign(endAngle - startAngle);
  const deltaAngle = Math.min(Math.abs(endAngle - startAngle), 360);

  return sign * deltaAngle;
};

const RADIAN = Math.PI / 180;

const polarToCartesian = (cx: number, cy: number, radius: number, angle: number) => ({
  x: cx + Math.cos(-RADIAN * angle) * radius,
  y: cy + Math.sin(-RADIAN * angle) * radius
});

const renderCustomizedLabelFactory = ({ lineHeight = 24, innerLabelFontSize = "1rem" }) => (props: LabelProps) => {
  const { value } = props;
  if (!value) {
    return null;
  }
  const lines = value
    .toString()
    .trim()
    .split("\n");
  const { cx, cy, outerRadius, startAngle, endAngle } = props.viewBox as Required<PolarViewBox>;
  const labelAngle = startAngle + getDeltaAngle(startAngle, endAngle) / 2;
  const { x, y } = polarToCartesian(cx, cy, outerRadius / 2, labelAngle);
  const yStart = y - (lines.length - 1) * (lineHeight / 2);
  return (
    <g>
      {lines.map((text, index) => (
        <text
          key={index}
          x={x}
          y={yStart + index * lineHeight}
          stroke="#fff"
          strokeWidth="0.5"
          fill="#fff"
          fontSize={innerLabelFontSize}
          textAnchor="middle"
          dominantBaseline="central"
        >
          {text}
        </text>
      ))}
    </g>
  );
};

export type PieChartItem = {
  value: number;
  innerLabel?: string;
  outerLabel?: string;
};

function defaultInnerLabel<T extends PieChartItem>(item: T) {
  return item.innerLabel || "";
}
function defaultOuterLabel<T extends PieChartItem>(item: T) {
  return item.outerLabel || "";
}

declare module "recharts" {
  interface LabelListProps {
    fill?: string;
  }
}

export default function SimplePieChart<T extends PieChartItem>({
  items,
  innerLabel = defaultInnerLabel,
  outerLabel = defaultOuterLabel,
  innerLabelLineHeight = 24,
  startAngle = 0,
  colors = DEFAULT_COLORS,
  innerLabelFontSize = "1rem",
  aspect = 1
}: {
  items: T[];
  innerLabel?: (item: T) => string;
  outerLabel?: (item: T) => string;
  innerLabelLineHeight?: number;
  startAngle?: number;
  colors?: string[];
  innerLabelFontSize?: string;
  aspect?: number;
}) {
  const cells = useMemo(
    () =>
      Array(items.length)
        .fill(0)
        .map((_, index) => <Cell fill={colors[index % colors.length]} fillOpacity={1} key={`cell-${index}`} />),
    [items.length, colors]
  );
  const renderCustomizedLabel = useMemo(
    () => renderCustomizedLabelFactory({ lineHeight: innerLabelLineHeight, innerLabelFontSize }),
    [innerLabelLineHeight, innerLabelFontSize]
  );
  return (
    <ResponsiveContainer width="100%" aspect={aspect} height="auto">
      <PieChart>
        <Pie
          isAnimationActive={false}
          data={items}
          nameKey="outerLabel"
          dataKey="value"
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          label={outerLabel as (x: any) => string}
          startAngle={startAngle}
          endAngle={startAngle + 360}
        >
          {cells}
          <LabelList
            valueAccessor={innerLabel}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            dataKey={undefined as any}
            position="inside"
            fill="#fff"
            content={renderCustomizedLabel}
          />
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}
