# Custom Date Picker LWC Component

A feature-rich Lightning Web Component (LWC) for Salesforce that provides a custom date picker with capacity management, holiday support, and Turkish localization.

## Features

- 🗓️ Custom calendar interface with Turkish localization
- 🏖️ Turkish national holidays support (automatically disabled)
- 📊 Capacity management with color-coded indicators
- 🚫 Weekend and past date restrictions
- 💡 Interactive tooltips showing capacity information
- 🎯 Responsive design for mobile and desktop
- ⚡ Lightning Design System (SLDS) integration

## Screenshots

<img width="284" height="403" alt="Ekran görüntüsü 2025-09-08 110232" src="https://github.com/user-attachments/assets/0d7c0a4c-7307-44be-9206-e027eef6b9a7" />

## Installation

### Option 1: Salesforce CLI (Recommended)

1. Clone this repository:
```bash
git clone https://github.com/yourusername/custom-date-picker-lwc.git
cd custom-date-picker-lwc
```

2. Authorize your Salesforce org:
```bash
sfdx force:auth:web:login -a myorg
```

3. Deploy to your org:
```bash
sfdx force:source:deploy -p force-app/main/default/lwc/customDatePicker
```

### Option 2: Salesforce Package

*Coming soon - package installation link*

## Usage

### Basic Usage

```html
<c-custom-date-picker 
    selected-date={selectedDate}
    target-date="2024-12-31"
    unit-quantity={orderQuantity}
    capacity-data={capacityData}
    onDateselect={handleDateSelect}>
</c-custom-date-picker>
```

### Component Properties

| Property | Type | Description | Required |
|----------|------|-------------|----------|
| `selectedDate` | String | Currently selected date (YYYY-MM-DD format) | No |
| `targetDate` | String | Target date for capacity calculations | Yes |
| `unitQuantity` | Number | Current order quantity | No |
| `capacityData` | Array | Array of capacity data objects | No |
| `selectedIndex` | Number | Row index for parent component tracking | No |

### Capacity Data Format

```javascript
capacityData = [
    {
        requestDate: '2024-03-15',
        availableCapacity: 100,
        currentQuantity: 50,
        remainingCapacity: 50
    },
    // ... more data
];
```

### Event Handling

```javascript
handleDateSelect(event) {
    const selectedDate = event.detail.selectedDate;
    const capacityInfo = event.detail.capacityInfo;
    
    // Handle date selection
    console.log('Selected date:', selectedDate);
    console.log('Capacity info:', capacityInfo);
}
```

## Holiday Configuration

The component includes Turkish national holidays by default:

- New Year's Day (January 1)
- National Sovereignty and Children's Day (April 23)
- Labour and Solidarity Day (May 1)
- Commemoration of Atatürk, Youth and Sports Day (May 19)
- Democracy and National Unity Day (July 15)
- Victory Day (August 30)
- Republic Day (October 29)

### Customizing Holidays

To modify holidays, edit the `holidays` getter in `customDatePicker.js`:

```javascript
get holidays() {
    return [
        { month: 1, day: 1, name: 'New Year' },
        // Add your custom holidays here
    ];
}
```

## Color Coding

The component uses color coding to indicate different date states:

- 🟢 **Green**: Sufficient capacity available
- 🟡 **Orange**: Exact capacity match
- 🔴 **Red**: Insufficient capacity
- 🔵 **Blue**: Official holidays (disabled)
- ⚫ **Gray**: Weekends (disabled)

## Customization

### Styling

The component uses CSS custom properties for easy theming. Override these in your parent component:

```css
.custom-theme {
    --calendar-primary-color: #0176d3;
    --calendar-success-color: #006600;
    --calendar-warning-color: #CC6600;
    --calendar-danger-color: #CC0000;
    --calendar-holiday-color: #4ea9afff;
}
```

### Localization

Currently supports Turkish localization. To add other languages, modify:
- Month names in `monthNames` getter
- Day names in `dayNames` getter
- Holiday names in `holidays` getter
- Text strings throughout the component

## Development

### Prerequisites

- Salesforce CLI
- Node.js and npm
- Salesforce DX project setup

### Local Development

1. Clone the repository
2. Set up Salesforce DX project if not already done:
```bash
sfdx force:project:create -n custom-date-picker-lwc
```

3. Copy the component files to the appropriate directories
4. Deploy to scratch org for testing:
```bash
sfdx force:org:create -f config/project-scratch-def.json -a test-org
sfdx force:source:push -u test-org
sfdx force:org:open -u test-org
```

## File Structure

```
force-app/main/default/lwc/customDatePicker/
├── customDatePicker.html          # Component template
├── customDatePicker.js            # Component logic
├── customDatePicker.css           # Component styles
└── customDatePicker.js-meta.xml   # Component metadata
```

## Browser Support

- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/halimemisoglu/custom-date-picker-lwc/issues) page
2. Create a new issue with detailed information
3. Include screenshots and error messages if applicable

## Changelog

### Version 1.0.0
- Initial release
- Turkish holiday support
- Capacity management
- Responsive design
- Tooltip functionality

## Acknowledgments

- Salesforce Lightning Design System
- Turkish national holidays calendar
- Community feedback and contributions

---

**Note**: This component is designed specifically for Salesforce Lightning Experience and requires proper Salesforce org setup for deployment.
