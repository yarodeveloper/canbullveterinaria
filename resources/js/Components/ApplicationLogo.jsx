import { usePage } from '@inertiajs/react';

export default function ApplicationLogo(props) {
    const { settings } = usePage().props;
    const logoUrl = settings?.site_logo?.startsWith('/') ? settings.site_logo : (settings?.site_logo ? '/' + settings.site_logo : null);

    if (logoUrl) {
        return (
            <img
                src={logoUrl}
                alt="Logo"
                {...props}
                style={{ objectFit: 'contain', ...props.style }}
            />
        );
    }

    return (
        <img
            src="/icons/pet-svgrepo-com.svg"
            alt="Default Logo"
            {...props}
            style={{ objectFit: 'contain', ...props.style }}
        />
    );
}
