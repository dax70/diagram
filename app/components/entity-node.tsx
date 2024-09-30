import { Handle, Position, NodeProps } from "@xyflow/react";

type EntityNodeProps = NodeProps & {
  data: {
    isEnum: boolean;
    label: string;
    attributes: Array<string>;
    constraints?: Array<string>;
  };
};

export default function EntityNode({ data, ...props }: EntityNodeProps) {
  return (
    <div className="bg-white border border-black text-xs">
      {data.isEnum && <div className="italic text-center">«enumeration»</div>}
      <div className="font-bold border-b border-black p-1 text-center">
        {data.label}
      </div>
      <div className="p-1">
        {data.attributes.map((attr, index) => (
          <div key={index} className="whitespace-nowrap">
            {attr}
          </div>
        ))}
        {data.constraints &&
          data.constraints.map((constraint, index) => (
            <div
              key={`constraint-${index}`}
              className="whitespace-nowrap text-gray-600"
            >
              {constraint}
            </div>
          ))}
      </div>
      <Handle
        type="target"
        position={props.targetPosition || Position.Top}
        className="w-2 h-2 !bg-black"
      />
      <Handle
        type="source"
        position={props.sourcePosition || Position.Bottom}
        className="w-2 h-2 !bg-black"
      />
    </div>
  );
}
