// Announcement Processor - Real-time MFM Logistics Announcement Processing
// Handles process changes like badge scanning updates automatically

export interface ProcessChange {
  id: string;
  type: 'badge_scan' | 'return_photo' | 'fuel_card' | 'vehicle_check';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  actionRequired: boolean;
  timestamp: number;
  source: 'amazon_manager' | 'mfm_logistics' | 'system';
}

export interface DriverAction {
  id: string;
  driverId: string;
  action: 'photo_required' | 'badge_visible' | 'process_updated';
  completed: boolean;
  dueBy: number;
  priority: 'urgent' | 'normal' | 'low';
}

export class AnnouncementProcessor {
  private processChanges: Map<string, ProcessChange> = new Map();
  private driverActions: Map<string, DriverAction[]> = new Map();
  private subscribers: Array<(change: ProcessChange) => void> = [];

  constructor() {
    this.initializeKnownProcessChanges();
  }

  private initializeKnownProcessChanges() {
    // Current real announcement about badge scanning
    const badgeScanChange: ProcessChange = {
      id: 'badge_scan_2026_04_21',
      type: 'badge_scan',
      title: 'Badge Scanning Process Changed',
      description: 'Drivers badges will no longer be scanned at RTS/Debrief. Badges still need to be visible on site, but no scanning required upon return to station.',
      impact: 'high',
      actionRequired: true,
      timestamp: Date.now(),
      source: 'amazon_manager'
    };

    this.addProcessChange(badgeScanChange);
  }

  addProcessChange(change: ProcessChange) {
    this.processChanges.set(change.id, change);
    this.notifySubscribers(change);
    this.updateDriverActions(change);
  }

  private updateDriverActions(change: ProcessChange) {
    if (change.type === 'badge_scan') {
      // Create driver actions for badge scanning change
      const allDrivers = this.getAllDriverIds();
      
      allDrivers.forEach(driverId => {
        const actions: DriverAction[] = [
          {
            id: `badge_visible_${driverId}`,
            driverId,
            action: 'badge_visible',
            completed: false,
            dueBy: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
            priority: 'urgent'
          },
          {
            id: `return_photo_${driverId}`,
            driverId,
            action: 'photo_required',
            completed: false,
            dueBy: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
            priority: 'urgent'
          }
        ];

        this.driverActions.set(driverId, actions);
      });
    }
  }

  private getAllDriverIds(): string[] {
    // In real implementation, this would query the driver database
    return ['DRIVER_07', 'DRIVER_03', 'DRIVER_01', 'DRIVER_02', 'DRIVER_04'];
  }

  getProcessChanges(): ProcessChange[] {
    return Array.from(this.processChanges.values());
  }

  getDriverActions(driverId: string): DriverAction[] {
    return this.driverActions.get(driverId) || [];
  }

  completeDriverAction(driverId: string, actionId: string) {
    const actions = this.driverActions.get(driverId);
    if (actions) {
      const action = actions.find(a => a.id === actionId);
      if (action) {
        action.completed = true;
        return true;
      }
    }
    return false;
  }

  subscribe(callback: (change: ProcessChange) => void) {
    this.subscribers.push(callback);
  }

  private notifySubscribers(change: ProcessChange) {
    this.subscribers.forEach(callback => callback(change));
  }

  // Process incoming WhatsApp announcements
  processWhatsAppMessage(message: string, sender: string): ProcessChange | null {
    // Analyze message for process changes
    if (message.includes('badge') && message.includes('scan')) {
      const change: ProcessChange = {
        id: `badge_scan_${Date.now()}`,
        type: 'badge_scan',
        title: 'Badge Scanning Update',
        description: message,
        impact: 'high',
        actionRequired: true,
        timestamp: Date.now(),
        source: sender.includes('MFM') ? 'mfm_logistics' : 'amazon_manager'
      };
      
      this.addProcessChange(change);
      return change;
    }

    if (message.includes('return') && message.includes('photo')) {
      const change: ProcessChange = {
        id: `return_photo_${Date.now()}`,
        type: 'return_photo',
        title: 'Return Photo Requirement',
        description: message,
        impact: 'medium',
        actionRequired: true,
        timestamp: Date.now(),
        source: 'mfm_logistics'
      };
      
      this.addProcessChange(change);
      return change;
    }

    return null;
  }

  getHighImpactChanges(): ProcessChange[] {
    return Array.from(this.processChanges.values()).filter(change => change.impact === 'high');
  }

  getActionableChanges(): ProcessChange[] {
    return Array.from(this.processChanges.values()).filter(change => change.actionRequired);
  }

  getDriverComplianceStatus(driverId: string): {
    totalActions: number;
    completedActions: number;
    urgentActions: number;
    compliancePercentage: number;
  } {
    const actions = this.getDriverActions(driverId);
    const completed = actions.filter(a => a.completed).length;
    const urgent = actions.filter(a => a.priority === 'urgent' && !a.completed).length;
    
    return {
      totalActions: actions.length,
      completedActions: completed,
      urgentActions: urgent,
      compliancePercentage: actions.length > 0 ? Math.round((completed / actions.length) * 100) : 100
    };
  }
}
