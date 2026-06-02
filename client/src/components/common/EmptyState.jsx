export default function EmptyState({
  icon,
  title,
  description,
  action,
  size = 'default'
}) {
  const padding = size === 'small' ? 'py-8' : 'py-16';
  const iconSize = size === 'small' ? 'w-12 h-12 text-2xl' : 'w-16 h-16 text-3xl';

  return (
    <div className={`flex flex-col items-center justify-center
                     text-center ${padding} px-4`}>
      <div className={`${iconSize} bg-gray-100 rounded-2xl
                       flex items-center justify-center mb-4`}>
        {typeof icon === 'string'
          ? <span>{icon}</span>
          : icon
        }
      </div>
      <h3 className="text-base font-semibold text-gray-900 mb-1">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-gray-400 max-w-xs mb-5">
          {description}
        </p>
      )}
      {action}
    </div>
  );
}
