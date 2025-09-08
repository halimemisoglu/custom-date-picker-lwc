// customDatePicker.js - Resmi Tatiller Disabled
import { LightningElement, track, api } from 'lwc';

export default class CustomDatePicker extends LightningElement {
    @api selectedDate;
    @api unitQuantity = 0; 
    @api selectedIndex; 
    @api capacityData = []; 
    @api targetDate; 
    @track isCalendarOpen = false;
    @track currentMonth = new Date().getMonth();
    @track currentYear = new Date().getFullYear();
    @track calendarDays = [];
    @track tooltipVisible = false;
    @track tooltipContent = '';
    @track tooltipPosition = { x: 0, y: 0 };

    // Resmi tatilleri tanımla
    get holidays() {
        return [
            { month: 1, day: 1, name: 'Yılbaşı' },           // 1 Ocak
            { month: 4, day: 23, name: 'Ulusal Egemenlik ve Çocuk Bayramı' }, // 23 Nisan
            { month: 5, day: 1, name: 'Emek ve Dayanışma Günü' },    // 1 Mayıs
            { month: 5, day: 19, name: 'Atatürk\'ü Anma, Gençlik ve Spor Bayramı' }, // 19 Mayıs
            { month: 7, day: 15, name: 'Demokrasi ve Millî Birlik Günü' }, // 15 Temmuz
            { month: 8, day: 30, name: 'Zafer Bayramı' },    // 30 Ağustos
            { month: 10, day: 29, name: 'Cumhuriyet Bayramı' } // 29 Ekim
        ];
    }

    // Tarihin resmi tatil olup olmadığını kontrol et
    isHoliday(date) {
        const month = date.getMonth() + 1; // JavaScript'te aylar 0'dan başlar
        const day = date.getDate();

        return this.holidays.some(holiday =>
            holiday.month === month && holiday.day === day
        );
    }

    connectedCallback() {
        this.generateCalendar();
        document.addEventListener('click', this.handleOutsideClick.bind(this));
    }

    disconnectedCallback() {
        document.removeEventListener('click', this.handleOutsideClick.bind(this));
    }

    get monthNames() {
        return [
            'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
            'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
        ];
    }

    get dayNames() {
        return ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
    }

    get displayValue() {
        if (this.selectedDate) {
            // Timezone offset sorununu çözmek için yerel tarih oluştur
            const parts = this.selectedDate.split('-');
            const date = new Date(parts[0], parts[1] - 1, parts[2]);
            return date.toLocaleDateString('tr-TR');
        }
        return 'Tarih seçiniz...';
    }

    get currentMonthYear() {
        return `${this.monthNames[this.currentMonth]} ${this.currentYear}`;
    }

    get capacityMap() {
        const map = new Map();
        if (this.capacityData && this.capacityData.length > 0) {
            this.capacityData.forEach(item => {
                const date = new Date(item.requestDate);
                const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                map.set(dateKey, {
                    availableCapacity: item.availableCapacity || 0,
                    currentQuantity: item.currentQuantity || 0,
                    remainingCapacity: item.remainingCapacity || 0
                });
            });
        }
        return map;
    }

    toggleCalendar() {
        this.isCalendarOpen = !this.isCalendarOpen;
        if (this.isCalendarOpen) {
            this.generateCalendar();
            // Takvim açılırken parent component'e focus eventi gönder
            this.dispatchEvent(new CustomEvent('focus', {
                detail: {
                    selectedIndex: this.selectedIndex
                }
            }));
        }
    }

    closeCalendar() {
        this.isCalendarOpen = false;
    }

    generateCalendar() {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Saat bilgisini sıfırla

        const firstDay = new Date(this.currentYear, this.currentMonth, 1);
        const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
        const startDate = new Date(firstDay);

        // Haftanın ilk günü Pazartesi olacak şekilde ayarla
        const dayOfWeek = (firstDay.getDay() + 6) % 7;
        startDate.setDate(startDate.getDate() - dayOfWeek);

        const days = [];
        const capacityMap = this.capacityMap;

        for (let i = 0; i < 42; i++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + i);
            currentDate.setHours(0, 0, 0, 0); // Saat bilgisini sıfırla

            const isCurrentMonth = currentDate.getMonth() === this.currentMonth;
            const isToday = this.isSameDate(currentDate, today);
            const isSelected = this.selectedDate && this.isSameDate(currentDate, this.createDateFromString(this.selectedDate));
            const isNextDays = this.isInNextDays(currentDate, today);
            const isPastDate = currentDate < today;
            const isSunday = currentDate.getDay() === 0;
            const isHolidayDate = this.isHoliday(currentDate); // Resmi tatil kontrolü

            // Kapasite bilgisini al
            const dateKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
            const capacityInfo = capacityMap.get(dateKey);

            // Günün stilini belirle
            const dayStyle = this.getDayStyle(currentDate, isNextDays, capacityInfo, isHolidayDate);

            // Seçilemez durumları belirle - resmi tatil kontrolü eklendi
            const isDisabled = isSunday || isPastDate || isToday || isHolidayDate || (capacityInfo && capacityInfo.availableCapacity === 0);

            days.push({
                date: currentDate.getDate(),
                fullDate: dateKey,
                isCurrentMonth: isCurrentMonth,
                isToday: isToday,
                isSelected: isSelected,
                isNextDays: isNextDays,
                isPastDate: isPastDate,
                isDisabled: isDisabled,
                isSunday: isSunday,
                isHoliday: isHolidayDate, // Resmi tatil bilgisi eklendi
                capacityInfo: capacityInfo,
                style: dayStyle.style || '',
                className: this.getDayClassName(currentDate, isCurrentMonth, isToday, isSelected, isNextDays, isPastDate, isDisabled, isSunday, isHolidayDate)
            });
        }

        this.calendarDays = days;
    }

    // String'den tarih oluştur (timezone sorunu olmadan)
    createDateFromString(dateString) {
        const parts = dateString.split('-');
        const date = new Date(parts[0], parts[1] - 1, parts[2]);
        date.setHours(0, 0, 0, 0);
        return date;
    }

    isSameDate(date1, date2) {
        return date1.getDate() === date2.getDate() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getFullYear() === date2.getFullYear();
    }

    isInNextDays(date, today) {

        const targetDateObj = this.createDateFromString(this.targetDate);

        const diffTime = targetDateObj.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
       
        return diffDays;
    }

    getDayStyle(date, isNextDays, capacityInfo, isHoliday) {
        if (!isNextDays) {
            return {};
        }

        // Resmi tatil ise disabled stil uygula (farklı renk ile)
        if (isHoliday) {
            return {
                style: 'background-color: #4ea9afff; color: #ffffff; border: 2px solid #2c5f63;'
            };
        }

        // Mevcut sipariş miktarını al
        const currentQuantity = parseFloat(this.unitQuantity) || 0;

        // Kapasite bilgisi varsa
        if (capacityInfo && capacityInfo.availableCapacity !== undefined) {
            const availableCapacity = capacityInfo.availableCapacity;

            // Pazar günü veya availableCapacity = 0 ise disabled
            if (availableCapacity === 0) {
                return {
                    style: 'background-color: #F0F0F0; color: #999999; border: 2px solid #CCCCCC;'
                };
            }

            const remainingCapacity = capacityInfo.remainingCapacity;

            if (remainingCapacity < 0) {
                // Yetersiz kapasite - Kırmızı
                return {
                    style: 'background-color: #FFE6E6; color: #CC0000; border: 2px solid #CC0000;'
                };
            } else if (remainingCapacity === 0) {
                // Tam kapasite - Turuncu
                return {
                    style: 'background-color: #FFF4E6; color: #CC6600; border: 2px solid #CC6600;'
                };
            } else {
                // Yeterli kapasite - Yeşil
                return {
                    style: 'background-color: #E6FFE6; color: #006600; border: 2px solid #006600;'
                };
            }
        }

        return {};
    }

    getDayClassName(date, isCurrentMonth, isToday, isSelected, isNextDays, isPastDate, isDisabled, isSunday, isHoliday) {
        let className = 'calendar-day';

        if (!isCurrentMonth) className += ' other-month';
        if (isToday) className += ' today';
        if (isSelected) className += ' selected';
        if (isNextDays) className += ' next-days';
        if (isPastDate) className += ' past-date';
        if (isDisabled) className += ' disabled';
        if (isSunday) className += ' disabled';
        if (isHoliday) className += ' holiday disabled'; // Resmi tatil class'ı eklendi

        return className;
    }

    selectDate(event) {
        const selectedDate = event.target.dataset.date;
        const selectedDay = this.calendarDays.find(day => day.fullDate === selectedDate);

        // Geçmiş tarihleri, disabled günleri, pazar günlerini ve resmi tatilleri seçmeye izin verme
        if (selectedDay && (selectedDay.isPastDate || selectedDay.isDisabled || selectedDay.isSunday || selectedDay.isToday || selectedDay.isHoliday)) {
            return;
        }

        this.selectedDate = selectedDate;
        this.isCalendarOpen = false;

        // Parent component'e seçilen tarihi ve kapasite bilgisini bildir
        this.dispatchEvent(new CustomEvent('dateselect', {
            detail: {
                selectedDate: selectedDate,
                capacityInfo: selectedDay ? selectedDay.capacityInfo : null
            }
        }));
    }

    previousMonth() {
        if (this.currentMonth === 0) {
            this.currentMonth = 11;
            this.currentYear--;
        } else {
            this.currentMonth--;
        }
        this.generateCalendar();
    }

    nextMonth() {
        if (this.currentMonth === 11) {
            this.currentMonth = 0;
            this.currentYear++;
        } else {
            this.currentMonth++;
        }
        this.generateCalendar();
    }

    handleOutsideClick(event) {
        const calendarContainer = this.template.querySelector('.calendar-popup');
        const inputWrapper = this.template.querySelector('.date-input-wrapper');

        if (this.isCalendarOpen && calendarContainer && inputWrapper) {
            if (!calendarContainer.contains(event.target) && !inputWrapper.contains(event.target)) {
                this.isCalendarOpen = false;
                this.hideTooltip();
            }
        }
    }

    // Tooltip işlemleri - Resmi tatil desteği eklendi
    handleDayMouseEnter(event) {
        const dateKey = event.target.dataset.date;
        const day = this.calendarDays.find(d => d.fullDate === dateKey);

        if (day) {
            const rect = event.target.getBoundingClientRect();
            const container = this.template.querySelector('.calendar-popup');
            const containerRect = container.getBoundingClientRect();

            this.tooltipPosition = {
                x: rect.left - containerRect.left + (rect.width / 2),
                y: rect.top - containerRect.top - 10
            };

            // Resmi tatil ise özel tooltip göster
            if (day.isHoliday) {
                const holidayInfo = this.holidays.find(h => {
                    const dayDate = this.createDateFromString(day.fullDate);
                    return h.month === (dayDate.getMonth() + 1) && h.day === dayDate.getDate();
                });

                this.tooltipContent = `Resmi Tatil: ${holidayInfo ? holidayInfo.name : 'Resmi Tatil'}`;
                this.tooltipVisible = true;
            }
            // Normal gün ve kapasite bilgisi varsa
            else if (day.isNextDays && day.capacityInfo) {
                const currentQuantity = parseFloat(this.unitQuantity) || 0;
                const remainingCapacity = day.capacityInfo.remainingCapacity;

                this.tooltipContent = `
                    Mevcut Kapasite: ${day.capacityInfo.availableCapacity}
                    Kullanılan: ${day.capacityInfo.currentQuantity}
                    Kalan: ${remainingCapacity}
                `.trim();
                this.tooltipVisible = true;
            }
            // Pazar günü ise
            else if (day.isSunday) {
                this.tooltipContent = 'Hafta Sonu - Seçilemez';
                this.tooltipVisible = true;
            }
        }
    }

    handleDayMouseLeave() {
        console.log('Tooltip 4');
        this.hideTooltip();
    }

    hideTooltip() {
        this.tooltipVisible = false;
        this.tooltipContent = '';
    }

    // Capacity data güncellendiğinde takvimi yenile
    @api
    updateCapacityData(newCapacityData) {
        this.capacityData = newCapacityData;
        this.generateCalendar();
    }

    get tooltipStyle() {
        console.log('Tooltip 5');
        return `left: ${this.tooltipPosition.x}px; top: ${this.tooltipPosition.y}px; transform: translateX(-50%);`;
    }
}