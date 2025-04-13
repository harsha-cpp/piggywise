interface PageHeaderProps {
  heading: string
  subheading?: string
}

export function PageHeader({ heading, subheading }: PageHeaderProps) {
  return (
    <div className="mb-8">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800">{heading}</h1>
      {subheading && (
        <p className="text-gray-500 mt-2">{subheading}</p>
      )}
    </div>
  )
} 