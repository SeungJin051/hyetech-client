interface HeroProps {
  title?: string;
  bigtitle?: string;
  bgColor?: string;
  children?: React.ReactNode;
}

export const Hero = ({ title, bigtitle, bgColor = "bg-white", children }: HeroProps) => {
  return (
    <section className={`flex flex-col gap-5 rounded-2xl p-4 ${bgColor}`}>
      {title && <h3 className="text-xl font-semibold">{title}</h3>}
      {bigtitle && <h3 className="text-2xl font-semibold">{bigtitle}</h3>}
      {children && <div className="">{children}</div>}
    </section>
  );
};
