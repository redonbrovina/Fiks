# Grafana Integration Guide

## Overview

The Fiks admin dashboard now includes **real-time system metrics** powered by Prometheus and Grafana.

## Features

### Embedded Grafana Charts in Admin Dashboard

The admin dashboard (`/admin/dashboard`) now displays:

1. **System Health** - Total services up indicator
2. **Request Rate** - HTTP requests per second by service
3. **CPU Usage** - Average CPU utilization across services
4. **Memory Usage** - RAM consumption by each microservice

All charts are **live** and update automatically every 5 seconds.

## Accessing Monitoring Tools

### 1. Admin Dashboard (Embedded View)
- **URL**: `http://localhost:5173/admin/dashboard`
- **Login**: Use admin credentials
- **Features**: Toggle metrics on/off with the button in the header

### 2. Grafana (Full Dashboard)
- **URL**: `http://localhost:3000`
- **Login**: 
  - Username: `admin`
  - Password: `admin`
- **Dashboard**: "Fiks Platform Overview"
- **Features**: Full-featured dashboard with additional panels and controls

### 3. Prometheus (Raw Metrics)
- **URL**: `http://localhost:9090`
- **Use**: Query raw metrics and verify scraping targets

## What's Being Monitored

### Services Monitored
- ✅ Identity Service (Port 3001)
- ✅ Catalog Service (Port 3002)
- ✅ Booking Service (Port 3003)
- ✅ Feedback Service (Port 3004)
- ✅ PostgreSQL Databases (all 4)
- ✅ Kafka
- ✅ Redis

### Metrics Collected
- HTTP request rates and latencies
- CPU usage per service
- Memory consumption
- Process uptime
- Database connections
- Service health status

## Configuration Files

### Prometheus
- **Config**: `infra/monitoring/prometheus.yml`
- **Scrape Interval**: 15 seconds
- **Jobs**: All microservices, databases, Kafka, Redis

### Grafana
- **Provisioning**: `infra/monitoring/grafana/provisioning/`
- **Datasources**: Prometheus (auto-configured)
- **Dashboards**: Fiks Platform Overview (auto-loaded)

## How It Works

1. **Prometheus** scrapes metrics from all services every 15 seconds
2. **Grafana** queries Prometheus for data visualization
3. **Admin Dashboard** embeds Grafana panels using iframes
4. **Anonymous access** enabled for seamless iframe embedding

## Customization

### Adding New Panels

To add more metrics to the admin dashboard:

1. Edit `infra/monitoring/grafana/provisioning/dashboards/fiks-overview.json`
2. Add new panel with unique `id`
3. Update `AdminDashboard.jsx` with the new panel ID

### Creating Custom Dashboards

1. Go to Grafana (`http://localhost:3000`)
2. Create new dashboard
3. Export JSON
4. Save to `infra/monitoring/grafana/provisioning/dashboards/`

## Troubleshooting

### Metrics Not Showing

1. Check if Prometheus is scraping:
   ```
   Visit http://localhost:9090/targets
   ```
2. Verify all targets are "UP"

### Grafana Charts Empty

1. Ensure Prometheus datasource is configured
2. Check time range in Grafana (top-right corner)
3. Verify services are exposing `/metrics` endpoint

### iframe Not Loading

1. Check browser console for CORS errors
2. Verify `GF_SECURITY_ALLOW_EMBEDDING=true` in docker-compose.yml
3. Ensure Grafana is accessible at `http://localhost:3000`

## Future Enhancements

- [ ] Add alerting rules for service downtime
- [ ] Create dedicated dashboards per service
- [ ] Add Kafka consumer lag metrics
- [ ] Implement distributed tracing with Jaeger
- [ ] Add custom business metrics (bookings, users, revenue)

## References

- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [Grafana Provisioning](https://grafana.com/docs/grafana/latest/administration/provisioning/)
