import { select } from 'd3-selection';

import { Actions, configureStore } from '../../store';

import { attachToNode } from './index';
import {provide} from "../../lib/redux";
import {drawGraphControls} from "./graph-controls";
import {drawDateRangeControls} from "./date-controls";

const TEST_STATE = {
    series: {
        timeSeries: {
            '00010:current': {
                points: [{
                    dateTime: 1514926800000,
                    value: 4,
                    qualifiers: ['P']
                }],
                method: 'method1',
                tsKey: 'current:P7D',
                variable: '45807190'
            },
            '00060:current': {
                points: [{
                    dateTime: 1514926800000,
                    value: 10,
                    qualifiers: ['P']
                }],
                method: 'method1',
                tsKey: 'current:P7D',
                variable: '45807197'
            },
            '00060:compare': {
                points: [{
                    dateTime: 1514926800000,
                    value: 10,
                    qualifiers: ['P']
                }],
                method: 'method1',
                tsKey: 'compare:P7D',
                variable: '45807197'
            }
        },
        timeSeriesCollections: {
            'coll1': {
                variable: '45807197',
                timeSeries: ['00060:current']
            },
            'coll2': {
                variable: '45807197',
                timeSeries: ['00060:compare']
            },
            'coll3': {
                variable: '45807197',
                timeSeries: ['00060:median']
            },
            'coll4': {
                variable: '45807190',
                timeSeries: ['00010:current']
            }
        },
        queryInfo: {
            'current:P7D': {
                notes: {
                    'filter:timeRange':  {
                        mode: 'PERIOD',
                        periodDays: 7
                    },
                    requestDT: 1522425600000
                }
            }
        },
        requests: {
            'current:P7D': {
                timeSeriesCollections: ['coll1']
            },
            'compare:P7D': {
                timeSeriesCollections: ['coll2', 'col4']
            }
        },
        variables: {
            '45807197': {
                variableCode: {
                    value: '00060'
                },
                oid: '45807197',
                variableName: 'Test title for 00060',
                variableDescription: 'Test description for 00060',
                unit: {
                    unitCode: 'unitCode'
                }
            },
            '45807190': {
                variableCode: {
                    value: '00010'
                },
                oid: '45807190',
                unit: {
                    unitCode: 'unitCode'
                }
            }
        },
        methods: {
            'method1': {
                methodDescription: 'method description'
            }
        }
    },
    statisticsData : {
        median: {
            '00060': {
                '1234': [
                    {
                        month_nu: '2',
                        day_nu: '20',
                        p50_va: '40',
                        begin_yr: '1970',
                        end_yr: '2017',
                        loc_web_ds: 'This method'
                    }, {
                        month_nu: '2',
                        day_nu: '21',
                        p50_va: '41',
                        begin_yr: '1970',
                        end_yr: '2017',
                        loc_web_ds: 'This method'
                    }, {
                        month_nu: '2',
                        day_nu: '22',
                        p50_va: '42',
                        begin_yr: '1970',
                        end_yr: '2017',
                        loc_web_ds: 'This method'
                    }
                ]
            }
        }
    },
    timeSeriesState: {
        currentVariableID: '45807197',
        currentDateRange: 'P7D',
        requestedTimeRange: null,
        showSeries: {
            current: true,
            compare: true,
            median: true
        },
        loadingTSKeys: []
    },
    ui: {
        width: 400
    }
};


describe('date-controls', () => {
    
    let div;
        let store;

        beforeEach(() => {
            div = select('body').append('div');
            store = configureStore(TEST_STATE);
            div.call(provide(store))
                .call(drawDateRangeControls, '12345678');
        });

        afterEach(() => {
            div.remove();
        });

    it('Expects the date range controls to be created', () => {
        let dateRangeContainer = select('#ts-daterange-select-container');
        let customDateDiv = select('div#ts-customdaterange-select-container');

        expect(dateRangeContainer.size()).toBe(1);
        expect(dateRangeContainer.selectAll('input[type=radio]').size()).toBe(4);
        expect(customDateDiv.attr('hidden')).toBe('true');
    });

    it('Expects to retrieve the extended time series when the radio buttons are change', () => {
        spyOn(Actions, 'retrieveExtendedTimeSeries');
        let lastRadio = select('#one-year');
        lastRadio.attr('checked', true);
        lastRadio.dispatch('change');

        expect(Actions.retrieveExtendedTimeSeries).toHaveBeenCalledWith('12345678', 'P1Y');
    });

    it('Expects to show the date range from when the Custom radio is selected', () => {
        let customRadio = select('#custom-date-range');
        customRadio.attr('checked', true);
        customRadio.dispatch('change');

        let customDateDiv = select('div#ts-customdaterange-select-container');
        expect(customDateDiv.attr('hidden')).toBeNull();

        let customDateAlertDiv = select('#custom-date-alert-container');
        expect(customDateAlertDiv.attr('hidden')).toBe('true');
    });

    it('Expects an alert to be thrown if custom dates are not provided.', () => {
         let submitButton = select('#custom-date-submit');
         submitButton.dispatch('click');

         let customDateAlertDiv = select('#custom-date-alert');
         expect(customDateAlertDiv.attr('hidden')).toBeNull();
         expect(customDateAlertDiv.select('p').text()).toEqual('Both start and end dates must be specified.');
    });

    it('Expects and alert to be thrown if the end date is earier than the start date.', () => {
        select('#custom-start-date').property('value', '2063-04-05');
        select('#custom-end-date').property('value', '2063-04-03');

        select('#custom-date-submit').dispatch('click');

        let customDateAlertDiv = select('#custom-date-alert-container');
        expect(customDateAlertDiv.attr('hidden')).toBeNull();
        expect(customDateAlertDiv.select('p').text()).toEqual('The start date must precede the end date.');
    });

    it('Expects data to be retrieved if both custom start and end dates are provided', () => {
        spyOn(Actions, 'retrieveUserRequestedDataForDateRange');

        select('#custom-start-date').property('value', '2063-04-03');
        select('#custom-end-date').property('value', '2063-04-05');

        select('#custom-date-submit').dispatch('click');

        let customDateAlertDiv = select('#custom-date-alert-container');
        expect(customDateAlertDiv.attr('hidden')).toBe('true');

        expect(Actions.retrieveUserRequestedDataForDateRange).toHaveBeenCalledWith(
            '12345678', '2063-04-03', '2063-04-05'
        );
    });
});