interface EditTextboxProps {
  input: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function EditTextbox({
  input,
  onChange,
  placeholder = "Enter your UML text here...",
}: EditTextboxProps) {
  return (
    <textarea
      className="flex-grow w-full p-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
      value={input}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  );
}
