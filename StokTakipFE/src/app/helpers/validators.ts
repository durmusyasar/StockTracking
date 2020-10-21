import { ValidatorFn, AbstractControl } from '@angular/forms';

export function RequiredOptionalFields(requiredAtLeast: number = 1, ...names: string[]): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
        const controls = names.map(n => {
            const c = control.get(n);
            if (c.errors && 'requiredAtLeast' in c.errors) {
                delete c.errors.requiredAtLeast;
                c.updateValueAndValidity({ emitEvent: false, onlySelf: true });
            }
            return c;
        });
        const result = controls.filter(v => v.enabled).length > 0 &&
            controls.filter(v => !!v.value && v.enabled).length < requiredAtLeast ? { requiredAtLeast: true } : null;
        if (result) { controls.forEach(c => {
            if (c.errors) {
                c.errors.requiredAtLeast = true;
                c.updateValueAndValidity({ emitEvent: false, onlySelf: true });
            }
            else {
                c.setErrors({ requiredAtLeast: true }, { emitEvent: false });
            }
        });
        }
        return result;
    };
}
