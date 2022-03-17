import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from './../../../../../@core/services/store.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { combineLatest, Subject } from 'rxjs';
import {
	IOrganization,
	ITimeLogFilters,
	IGetActivitiesInput,
	ActivityType,
	IDailyActivity,
	IActivity,
	IURLMetaData
} from '@gauzy/contracts';
import { debounceTime, filter, tap } from 'rxjs/operators';
import { isJsObject, toUTC, toLocal } from '@gauzy/common-angular';
import { ActivatedRoute } from '@angular/router';
import * as _ from 'underscore';
import * as moment from 'moment';
import { ActivityService } from './../../../../../@shared/timesheet/activity.service';
import { TimesheetFilterService } from './../../../../../@shared/timesheet/timesheet-filter.service';

@UntilDestroy({ checkProperties: true })
@Component({
	selector: 'ngx-app-url-activity',
	styleUrls: ['./app-url-activity.component.scss'],
	templateUrl: './app-url-activity.component.html'
})
export class AppUrlActivityComponent implements OnInit, OnDestroy {
	loading: boolean;
	apps: {
		hour: string;
		activities: IDailyActivity[];
	}[];
	request: any;
	activities$: Subject<any> = new Subject();
	organization: IOrganization;
	type: 'apps' | 'urls';
	selectedEmployeeId: string | null = null;
	projectId: string | null = null;

	constructor(
		private readonly store: Store,
		private readonly activatedRoute: ActivatedRoute,
		private readonly timesheetFilterService: TimesheetFilterService,
		private readonly activityService: ActivityService
	) {}

	ngOnInit(): void {
		this.activities$
			.pipe(
				untilDestroyed(this),
				debounceTime(500),
				tap(() => this.getLogs())
			)
			.subscribe();
		this.activatedRoute.data
			.pipe(
				tap((params) => this.type = params.type),
				tap(() => this.activities$.next(true)),
				untilDestroyed(this)
			)
			.subscribe();
		const storeOrganization$ = this.store.selectedOrganization$;
		const storeEmployee$ = this.store.selectedEmployee$;
		const storeProject$ = this.store.selectedProject$;
		combineLatest([storeOrganization$, storeEmployee$, storeProject$])
			.pipe(
				filter(([organization]) => !!organization),
				tap(([organization, employee, project]) => {
					if (organization) {
						this.organization = organization;
						this.selectedEmployeeId = employee ? employee.id : null;
						this.projectId = project ? project.id : null;
						this.activities$.next(true);
					}
				}),
				untilDestroyed(this)
			)
			.subscribe();
	}

	async filtersChange($event: ITimeLogFilters) {
		this.request = $event;
		this.timesheetFilterService.filter = $event;
		this.activities$.next(true);
	}

	loadChild(item: IDailyActivity) {
		const date = toLocal(item.date).format('YYYY-MM-DD') + ' ' + item.time;
		const request: IGetActivitiesInput = {
			startDate: toUTC(date).format('YYYY-MM-DD HH:mm:ss'),
			endDate: toUTC(date).add(1, 'hour').format('YYYY-MM-DD HH:mm:ss'),
			employeeIds: [item.employeeId],
			types: [this.type === 'urls' ? ActivityType.URL : ActivityType.APP],
			titles: [item.title]
		};

		this.activityService.getActivities(request).then((items) => {
			item.childItems = items.map(
				(activity: IActivity): IDailyActivity => {
					const dailyActivity = {
						duration: activity.duration,
						employeeId: activity.employeeId,
						date: activity.date,
						title: activity.title,
						description: activity.description,
						durationPercentage: (activity.duration * 100) / item.duration
					}
					if (activity.metaData && isJsObject(activity.metaData)) {
						const metaData = activity.metaData as IURLMetaData;
						dailyActivity['metaData'] = metaData;
						dailyActivity['url'] = metaData.url || '';
					}
					return dailyActivity;
				}
			);
		});
	}

	async getLogs() {
		if (!this.organization || !this.request) {
			return;
		}

		const { startDate, endDate } = this.request;
		const { id: organizationId } = this.organization;
		const { tenantId } = this.store.user;

		const employeeIds: string[] = [];
		if (this.selectedEmployeeId) {
			employeeIds.push(this.selectedEmployeeId);
		}

		const projectIds: string[] = [];
		if (this.projectId) {
			projectIds.push(this.projectId);
		}

		const request: IGetActivitiesInput = {
			organizationId,
			tenantId,
			...this.request,
			startDate: toUTC(startDate).format('YYYY-MM-DD HH:mm:ss'),
			endDate: toUTC(endDate).format('YYYY-MM-DD HH:mm:ss'),
			...(employeeIds.length > 0 ? { employeeIds } : {}),
			...(projectIds.length > 0 ? { projectIds } : {}),
			types: [this.type === 'apps' ? ActivityType.APP : ActivityType.URL]
		};

		this.loading = true;
		this.activityService
			.getDailyActivities(request)
			.then((activities) => {
				this.apps = _.chain(activities)
					.map((activity) => {
						activity.hours = toLocal(
							moment.utc(
								moment.utc(activity.date).format('YYYY-MM-DD') +
									' ' +
									activity.time
							)
						);
						return activity;
					})
					.groupBy('hours')
					.mapObject((value, key) => {
						value = value.slice(0, 6);
						const sum = _.reduce(
							value,
							(memo, activity) =>
								memo + parseInt(activity.duration + '', 10),
							0
						);
						value = value.map((activity) => {
							activity.durationPercentage = parseFloat(
								((activity.duration * 100) / sum).toFixed(1)
							);
							return activity;
						});
						return { hour: key, activities: value };
					})
					.values()
					.value();
			})
			.finally(() => (this.loading = false));
	}

	ngOnDestroy(): void {}
}
