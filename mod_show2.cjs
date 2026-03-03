const fs = require('fs');
let content = fs.readFileSync('resources/js/Pages/Surgeries/Show.jsx', 'utf8');

const oldEndSurgery = `    const endSurgery = () => {
        if (confirm('¿Confirmas que el procedimiento ha terminado?')) {
            router.patch(route('surgeries.update', surgery.id), {
                status: 'completed',
                end_time: new Date().toISOString(),
                intra_op_notes: notes.intra,
                post_op_notes: notes.post
            });
        }
    };`;

const newEndSurgery = `    const endSurgery = () => {
        if (confirm('¿Confirmas que el procedimiento ha terminado?')) {
            router.patch(route('surgeries.update', surgery.id), {
                status: 'completed',
                end_time: new Date().toISOString(),
                intra_op_notes: notes.intra,
                post_op_notes: notes.post,
                vital_signs: vitalSigns
            });
        }
    };

    const saveVitals = () => {
        updateSurgery({ vital_signs: vitalSigns, intra_op_notes: notes.intra });
    };

    const goToHospitalization = () => {
        router.get(route('hospitalizations.create', { pet_id: surgery.pet.id, prior_surgery: surgery.id }));
    };`;

content = content.replace(oldEndSurgery, newEndSurgery);
fs.writeFileSync('resources/js/Pages/Surgeries/Show.jsx', content);
