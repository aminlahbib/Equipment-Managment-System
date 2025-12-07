# Database Backup Strategy

This document outlines the backup strategy for the Equipment Management System database.

## Overview

The Equipment Management System uses MySQL 8.0 as its database, running in Kubernetes with persistent storage via PersistentVolumeClaim (PVC). This document provides guidelines for implementing a comprehensive backup strategy.

## Backup Methods

### 1. MySQL Native Backup (mysqldump)

**Recommended for:** Regular scheduled backups, point-in-time recovery

#### Manual Backup

```bash
# Connect to MySQL pod
kubectl exec -it <mysql-pod-name> -n equipment-system -- bash

# Create backup
mysqldump -u root -p swtp > /tmp/backup_$(date +%Y%m%d_%H%M%S).sql

# Copy backup from pod to local machine
kubectl cp equipment-system/<mysql-pod-name>:/tmp/backup_20240101_120000.sql ./backup_20240101_120000.sql
```

#### Automated Backup Script

Create a Kubernetes CronJob for automated backups:

```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: mysql-backup
  namespace: equipment-system
spec:
  schedule: "0 2 * * *"  # Daily at 2 AM
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: mysql-backup
            image: mysql:8.0
            command:
            - /bin/bash
            - -c
            - |
              mysqldump -h mysql-service -u root -p$MYSQL_ROOT_PASSWORD swtp > /backup/backup_$(date +%Y%m%d_%H%M%S).sql
              # Keep only last 7 days of backups
              find /backup -name "backup_*.sql" -mtime +7 -delete
            env:
            - name: MYSQL_ROOT_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: db-secret
                  key: password
            volumeMounts:
            - name: backup-storage
              mountPath: /backup
          volumes:
          - name: backup-storage
            persistentVolumeClaim:
              claimName: mysql-backup-pvc
          restartPolicy: OnFailure
```

### 2. PVC Snapshot (Kubernetes)

**Recommended for:** Fast recovery, volume-level backups

#### Create Snapshot

```bash
# Create VolumeSnapshot
kubectl apply -f - <<EOF
apiVersion: snapshot.storage.k8s.io/v1
kind: VolumeSnapshot
metadata:
  name: mysql-snapshot-$(date +%Y%m%d)
  namespace: equipment-system
spec:
  source:
    persistentVolumeClaimName: mysql-pvc
EOF
```

#### Restore from Snapshot

```bash
# Create PVC from snapshot
kubectl apply -f - <<EOF
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: mysql-pvc-restored
  namespace: equipment-system
spec:
  dataSource:
    name: mysql-snapshot-20240101
    kind: VolumeSnapshot
    apiGroup: snapshot.storage.k8s.io
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi
EOF
```

### 3. External Backup Storage

**Recommended for:** Off-cluster backups, disaster recovery

#### S3-Compatible Storage

Use tools like `rclone` or `s3cmd` to upload backups to S3:

```bash
# Install rclone in backup job
# Upload backup to S3
rclone copy /backup/backup_20240101_120000.sql s3://equipment-backups/mysql/
```

## Backup Schedule

### Recommended Schedule

- **Daily Backups:** Full database dump at 2 AM
- **Weekly Backups:** Full database dump + PVC snapshot on Sunday
- **Monthly Backups:** Archive to external storage (S3, etc.)

### Retention Policy

- **Daily backups:** Keep for 7 days
- **Weekly backups:** Keep for 4 weeks
- **Monthly backups:** Keep for 12 months

## Backup Verification

### Test Restore Procedure

Regularly test backup restoration:

```bash
# 1. Create test database
kubectl exec -it <mysql-pod-name> -n equipment-system -- mysql -u root -p -e "CREATE DATABASE swtp_test;"

# 2. Restore backup
kubectl exec -it <mysql-pod-name> -n equipment-system -- mysql -u root -p swtp_test < backup_20240101_120000.sql

# 3. Verify data
kubectl exec -it <mysql-pod-name> -n equipment-system -- mysql -u root -p -e "USE swtp_test; SELECT COUNT(*) FROM benutzer;"
```

## Disaster Recovery Plan

### Recovery Steps

1. **Identify the issue:** Determine if it's data corruption, accidental deletion, or complete failure
2. **Choose recovery method:**
   - **Point-in-time recovery:** Use mysqldump backup
   - **Volume recovery:** Use PVC snapshot
   - **Complete restore:** Restore from external backup
3. **Restore database:**
   ```bash
   # Stop application
   kubectl scale deployment equipment-app --replicas=0 -n equipment-system
   
   # Restore database
   kubectl exec -it <mysql-pod-name> -n equipment-system -- mysql -u root -p swtp < backup_file.sql
   
   # Restart application
   kubectl scale deployment equipment-app --replicas=2 -n equipment-system
   ```
4. **Verify application:** Test critical functionality
5. **Monitor:** Watch logs and metrics for issues

## Monitoring and Alerts

### Backup Monitoring

- Monitor backup job success/failure
- Alert on backup failures
- Track backup sizes and durations
- Verify backup integrity

### Example Monitoring Queries

```bash
# Check last backup time
kubectl get cronjob mysql-backup -n equipment-system

# Check backup job status
kubectl get jobs -n equipment-system | grep mysql-backup

# View backup logs
kubectl logs -n equipment-system -l job-name=mysql-backup-<timestamp>
```

## Best Practices

1. **Automate backups:** Never rely on manual backups
2. **Test restores:** Regularly test backup restoration
3. **Off-site storage:** Keep backups in separate location
4. **Encryption:** Encrypt backups containing sensitive data
5. **Documentation:** Document all backup and restore procedures
6. **Monitoring:** Set up alerts for backup failures
7. **Version control:** Track backup versions and retention policies

## Tools and Resources

- **MySQL Backup Tools:** mysqldump, mysqlbackup, Percona XtraBackup
- **Kubernetes:** VolumeSnapshots, CronJobs, StatefulSets
- **Cloud Storage:** AWS S3, Google Cloud Storage, Azure Blob Storage
- **Backup Tools:** Velero, Kasten K10, Stash

## Implementation Checklist

- [ ] Set up automated daily backups (CronJob)
- [ ] Configure backup storage (PVC or external)
- [ ] Implement backup retention policy
- [ ] Set up backup monitoring and alerts
- [ ] Document restore procedures
- [ ] Test restore process
- [ ] Schedule regular restore tests
- [ ] Configure off-site backup storage
- [ ] Encrypt sensitive backups
- [ ] Document disaster recovery plan

## Notes

- Backups should be tested regularly to ensure they work
- Consider using managed database services (RDS, Cloud SQL) for production
- Implement point-in-time recovery for critical data
- Keep backups encrypted and secure
- Follow 3-2-1 backup rule: 3 copies, 2 different media, 1 off-site

