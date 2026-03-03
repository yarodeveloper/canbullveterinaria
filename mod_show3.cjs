const fs = require('fs');
let content = fs.readFileSync('resources/js/Pages/Surgeries/Show.jsx', 'utf8');

content = content.replace(
    /const endSurgery = \(\) => \{\n\s+if \(confirm\('¿Confirmas que el procedimiento ha terminado\?'\)\) \{\n\s+router\.patch\(route\('surgeries\.update', surgery\.id\), \{\n\s+status: 'completed',\n\s+end_time: new Date\(\)\.toISOString\(\),\n\s+intra_op_notes: notes\.intra,\n\s+post_op_notes: notes\.post\n\s+\}\);\n\s+\}\n\s+\};/gm,
    `const endSurgery = () => {
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
    };`
);

fs.writeFileSync('resources/js/Pages/Surgeries/Show.jsx', content);
