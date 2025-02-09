const OCButton = ({ ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  return (
    <button
      {...props}
      className="w-full bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 font-bold py-1 px-3 rounded-full transition duration-300 ease-in-out border border-purple-500/30 hover:border-purple-500/50"
    />
  );
};

export default OCButton;
