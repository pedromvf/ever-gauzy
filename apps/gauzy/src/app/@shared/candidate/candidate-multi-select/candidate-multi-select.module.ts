import { NgModule } from '@angular/core';
import { NbSelectModule } from '@nebular/theme';
import { ThemeModule } from '../../../@theme/theme.module';
import { CandidateMultiSelectComponent } from './candidate-multi-select.component';
import { SharedModule } from '../../shared.module';
import { TranslateModule } from '@gauzy/ui-sdk/i18n';

@NgModule({
	imports: [ThemeModule, NbSelectModule, SharedModule, TranslateModule],
	declarations: [CandidateMultiSelectComponent],
	exports: [CandidateMultiSelectComponent],
	providers: []
})
export class CandidateMultiSelectModule {}
