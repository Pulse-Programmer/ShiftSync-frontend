interface UserAvatarProps {
  firstName: string;
  lastName: string;
  photoUrl?: string | null;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'w-7 h-7 text-xs',
  md: 'w-8 h-8 text-xs',
  lg: 'w-12 h-12 text-lg',
};

export function UserAvatar({ firstName, lastName, photoUrl, size = 'md' }: UserAvatarProps) {
  const cls = sizeClasses[size];

  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={`${firstName} ${lastName}`}
        className={`${cls} rounded-full object-cover shrink-0`}
      />
    );
  }

  return (
    <div className={`${cls} rounded-full bg-primary/20 flex items-center justify-center shrink-0`}>
      <span className="font-bold text-primary">
        {firstName[0]}{lastName[0]}
      </span>
    </div>
  );
}
