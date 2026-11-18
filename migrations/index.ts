import * as migration_20260925_091734_initial from './20260925_091734_initial';
import * as migration_20260928_023808_dashboard_fields from './20260928_023808_dashboard_fields';
import * as migration_20260928_034546_booking_locations from './20260928_034546_booking_locations';
import * as migration_20261118_004913_ape_promo from './20261118_004913_ape_promo';

export const migrations = [
  {
    up: migration_20260925_091734_initial.up,
    down: migration_20260925_091734_initial.down,
    name: '20260925_091734_initial',
  },
  {
    up: migration_20260928_023808_dashboard_fields.up,
    down: migration_20260928_023808_dashboard_fields.down,
    name: '20260928_023808_dashboard_fields',
  },
  {
    up: migration_20260928_034546_booking_locations.up,
    down: migration_20260928_034546_booking_locations.down,
    name: '20260928_034546_booking_locations',
  },
  {
    up: migration_20261118_004913_ape_promo.up,
    down: migration_20261118_004913_ape_promo.down,
    name: '20261118_004913_ape_promo',
  },
];
