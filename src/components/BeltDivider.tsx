interface BeltDividerProps {
  className?: string;
}

export default function BeltDivider({ className = '' }: BeltDividerProps) {
  return (
    <div className={`w-full overflow-hidden ${className}`} aria-hidden="true">
      <div
        className="h-10 md:h-14 w-full opacity-80"
        style={{
          backgroundImage: 'url(/yca_golden_belt_transparent_clean_v2.png)',
          backgroundRepeat: 'repeat-x',
          backgroundSize: 'auto 100%',
          backgroundPosition: 'center',
        }}
      />
    </div>
  );
}
