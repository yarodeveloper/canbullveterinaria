<?php
$file = 'resources/js/Pages/Pets/Show.jsx';
$content = file_get_contents($file);

// Add state to the Show component
$componentStart = 'export default function Show({ auth, pet, protocols, clients }) {';
$newState = <<<JSX
export default function Show({ auth, pet, protocols, clients }) {
    const [timelineFilter, setTimelineFilter] = useState('all');

    const timelineEvents = [
        ...(pet.medical_records || []).map(record => ({
            ...record,
            timeline_type: 'consultation',
            timeline_date: new Date(record.created_at),
        })),
        ...(pet.surgeries || []).map(surgery => ({
            ...surgery,
            timeline_type: 'surgery',
            timeline_date: new Date(surgery.scheduled_at || surgery.created_at),
        })),
        ...(pet.hospitalizations || []).map(hosp => ({
            ...hosp,
            timeline_type: 'hospitalization',
            timeline_date: new Date(hosp.admission_date || hosp.created_at),
        })),
        ...(pet.preventive_records || []).map(prev => ({
            ...prev,
            timeline_type: 'vaccine',
            timeline_date: new Date(prev.application_date || prev.created_at),
        }))
    ].sort((a, b) => b.timeline_date - a.timeline_date);

    const filteredTimeline = timelineEvents.filter(event => {
        if (timelineFilter === 'all') return true;
        if (timelineFilter === 'consultations' && event.timeline_type === 'consultation') return true;
        if (timelineFilter === 'surgery' && (event.timeline_type === 'surgery' || event.timeline_type === 'hospitalization')) return true;
        if (timelineFilter === 'lab' && event.timeline_type === 'vaccine') return true;
        return false;
    });
JSX;

$content = str_replace($componentStart, $newState, $content);

// Update filter buttons
$oldFilters = '<div className="flex bg-gray-50/80 dark:bg-gray-800/80 rounded-full p-1 border border-gray-100 dark:border-gray-700 overflow-x-auto hide-scrollbar sm:max-w-max">
                                        <button className="px-5 py-2 rounded-full bg-white dark:bg-gray-700 text-[10px] font-black uppercase text-brand-primary dark:text-white shadow-sm whitespace-nowrap transition-shadow flex-1 sm:flex-none">All</button>
                                        <button className="px-5 py-2 rounded-full text-[10px] font-black uppercase text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors whitespace-nowrap flex-1 sm:flex-none">Consultations</button>
                                        <button className="px-5 py-2 rounded-full text-[10px] font-black uppercase text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors whitespace-nowrap flex-1 sm:flex-none">Surgery</button>
                                        <button className="px-5 py-2 rounded-full text-[10px] font-black uppercase text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors whitespace-nowrap flex-1 sm:flex-none">Lab / Vaccines</button>
                                    </div>';

$newFilters = <<<JSX
<div className="flex bg-gray-50/80 dark:bg-gray-800/80 rounded-full p-1 border border-gray-100 dark:border-gray-700 overflow-x-auto hide-scrollbar sm:max-w-max">
                                        <button onClick={() => setTimelineFilter('all')} className={`px-5 py-2 rounded-full text-[10px] font-black uppercase whitespace-nowrap transition-shadow flex-1 sm:flex-none \${timelineFilter === 'all' ? 'bg-white dark:bg-gray-700 text-brand-primary dark:text-white shadow-sm' : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}>All</button>
                                        <button onClick={() => setTimelineFilter('consultations')} className={`px-5 py-2 rounded-full text-[10px] font-black uppercase whitespace-nowrap flex-1 sm:flex-none \${timelineFilter === 'consultations' ? 'bg-white dark:bg-gray-700 text-brand-primary dark:text-white shadow-sm' : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}>Consultations</button>
                                        <button onClick={() => setTimelineFilter('surgery')} className={`px-5 py-2 rounded-full text-[10px] font-black uppercase whitespace-nowrap flex-1 sm:flex-none \${timelineFilter === 'surgery' ? 'bg-white dark:bg-gray-700 text-brand-primary dark:text-white shadow-sm' : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}>Surgery</button>
                                        <button onClick={() => setTimelineFilter('lab')} className={`px-5 py-2 rounded-full text-[10px] font-black uppercase whitespace-nowrap flex-1 sm:flex-none \${timelineFilter === 'lab' ? 'bg-white dark:bg-gray-700 text-brand-primary dark:text-white shadow-sm' : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}>Lab / Vaccines</button>
                                    </div>
JSX;

$content = str_replace($oldFilters, $newFilters, $content);

// Update map block
preg_match('/<div className="p-8">\s*\{pet\.medical_records\?\.length > 0 \? \((.*?)\) : \(/s', $content, $matches);
if (!empty($matches)) {
    $oldMapBlock = $matches[0];
    
    $newMapBlock = <<<JSX
<div className="p-8">
                                    {filteredTimeline.length > 0 ? (
                                        <div className="space-y-12 relative">
                                            {/* Vertical Line */}
                                            <div className="absolute left-[2.1rem] top-4 bottom-4 w-px bg-gray-200 dark:bg-gray-700"></div>

                                            {filteredTimeline.map(event => (
                                                <TimelineItem key={\`\${event.timeline_type}-\${event.id}\`} event={event} />
                                            ))}
                                        </div>
                                    ) : (
JSX;
    $content = str_replace($oldMapBlock, $newMapBlock, $content);
}

file_put_contents($file, $content);
echo "Done";
?>
