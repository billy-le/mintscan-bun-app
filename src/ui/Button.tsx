export function Button({
  text,
  ...props
}: {
  text: string;
  type: JSX.IntrinsicElements["button"]["type"];
}) {
  return (
    <button
      class="px-3 py-2 border-none bg-blue-400 text-white rounded-md text-sm"
      {...props}
    >
      {text}
    </button>
  );
}
