import React, { useState } from 'react';
import { Clock, Calendar, BarChart3, MapPin, Play, Square } from 'lucide-react';
import SmartTimeTracker from '../../components/smart/SmartTimeTracker';

interface TimeEntry {
  id: string;
  taskTitle: string;
  customer: string;
  date: string;
  startTime: string;
  endTime?: string;
  totalHours?: number;
  isActive: boolean;
  location?: { lat: number; lng: number };
  isAutomatic: boolean;
  notes?: string;
}

const mockTimeEntries: TimeEntry[] = [
  {
    id: '1',
    taskTitle: 'Ugentlig rengøring',
    customer: 'Netto Supermarked',
    date: '2024-01-22',
    startTime: '08:00',
    endTime: '12:15',
    totalHours: 4.25,
    isActive: false,
    isAutomatic: true,
    location: { lat: 55.6761, lng: 12.5683 }
  },
  {
    id: '2',
    taskTitle: 'Vinduespolering',
    customer: 'Kontorbygning A/S',
    date: '2024-01-22',
    startTime: '13:30',
    totalHours: undefined,
    isActive: true,
    isAutomatic: true,
    location: { lat: 55.6861, lng: 12.5783 }
  }
];

const mockCurrentTask = {
  id: 'task-2',
  title: 'Vinduespolering',
  customer: 'Kontorbygning A/S',
  address: 'Erhvervsvej 45, 2100 København Ø',
  location: { lat: 55.6861, lng: 12.5783 }
};

export default function EmployeeTimeTracking() {
  const [timeEntries, setTimeEntries] = useState(mockTimeEntries);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showWeekView, setShowWeekView] = useState(false);

  const activeEntry = timeEntries.find(entry => entry.isActive);
  const todayEntries = timeEntries.filter(entry => entry.date === selectedDate);
  const totalHoursToday = todayEntries
    .filter(entry => entry.totalHours)
    .reduce((sum, entry) => sum + (entry.totalHours || 0), 0);

  const handleTimeStart = (taskId: string, location?: { lat: number; lng: number }) => {
    const newEntry: TimeEntry = {
      id: Date.now().toString(),
      taskTitle: mockCurrentTask.title,
      customer: mockCurrentTask.customer,
      date: selectedDate,
      startTime: new Date().toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit' }),
      isActive: true,
      isAutomatic: !!location,
      location
    };

    setTimeEntries([...timeEntries, newEntry]);
  };

  const handleTimeStop = (entryId: string, location?: { lat: number; lng: number }) => {
    setTimeEntries(entries =>
      entries.map(entry => {
        if (entry.id === entryId) {
          const endTime = new Date().toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit' });
          const startTime = new Date(`${entry.date}T${entry.startTime}`);
          const endTimeDate = new Date(`${entry.date}T${endTime}`);
          const totalHours = (endTimeDate.getTime() - startTime.getTime()) / (1000 * 60 * 60);

          return {
            ...entry,
            endTime,
            totalHours: Math.round(totalHours * 100) / 100,
            isActive: false
          };
        }
        return entry;
      })
    );
  };

  const getWeekData = () => {
    const weekStart = new Date(selectedDate);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1); // Monday

    const weekData = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayEntries = timeEntries.filter(entry => entry.date === dateStr);
      const totalHours = dayEntries
        .filter(entry => entry.totalHours)
        .reduce((sum, entry) => sum + (entry.totalHours || 0), 0);

      weekData.push({
        date: dateStr,
        dayName: date.toLocaleDateString('da-DK', { weekday: 'short' }),
        totalHours,
        entries: dayEntries.length
      });
    }

    return weekData;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tidsregistrering</h1>
          <p className="mt-1 text-sm text-gray-600">Smart tidsregistrering med automatisk start/stop</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowWeekView(!showWeekView)}
            className={`px-3 py-2 text-sm font-medium rounded-md ${
              showWeekView 
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {showWeekView ? 'Dag visning' : 'Uge visning'}
          </button>
        </div>
      </div>

      {/* Smart Time Tracker */}
      <SmartTimeTracker
        currentTask={mockCurrentTask}
        onTimeStart={handleTimeStart}
        onTimeStop={handleTimeStop}
        activeEntry={activeEntry}
      />

      {/* Daily Summary */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Timer i dag
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {totalHoursToday.toFixed(1)}t
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BarChart3 className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Opgaver i dag
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {todayEntries.length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Timer denne uge
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {getWeekData().reduce((sum, day) => sum + day.totalHours, 0).toFixed(1)}t
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Date Filter */}
      <div className="flex items-center space-x-4">
        <Calendar className="h-5 w-5 text-gray-400" />
        <input
          type="date"
          className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
      </div>

      {/* Week View */}
      {showWeekView && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Uge oversigt
            </h3>
            <div className="grid grid-cols-7 gap-4">
              {getWeekData().map((day) => (
                <div key={day.date} className="text-center">
                  <div className="text-sm font-medium text-gray-900 mb-2">
                    {day.dayName}
                  </div>
                  <div className="text-xs text-gray-500 mb-2">
                    {new Date(day.date).getDate()}
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3">
                    <div className="text-lg font-bold text-blue-900">
                      {day.totalHours.toFixed(1)}t
                    </div>
                    <div className="text-xs text-blue-700">
                      {day.entries} opgaver
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Time Entries */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Tidsregistreringer for {new Date(selectedDate).toLocaleDateString('da-DK')}
          </h3>
        </div>
        <ul className="divide-y divide-gray-200">
          {todayEntries.map((entry) => (
            <li key={entry.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                        entry.isActive ? 'bg-blue-100' : 'bg-gray-100'
                      }`}>
                        {entry.isActive ? (
                          <div className="h-3 w-3 bg-blue-600 rounded-full animate-pulse"></div>
                        ) : (
                          <Clock className="h-5 w-5 text-gray-600" />
                        )}
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-gray-900">{entry.taskTitle}</p>
                        {entry.isActive && (
                          <span className="ml-2 inline-flex px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                            Aktiv
                          </span>
                        )}
                        {entry.isAutomatic && (
                          <span className="ml-2 inline-flex px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                            Automatisk
                          </span>
                        )}
                      </div>
                      <div className="mt-1">
                        <p className="text-sm text-gray-600">{entry.customer}</p>
                        <div className="flex items-center mt-1 text-sm text-gray-500">
                          <Clock className="flex-shrink-0 mr-1.5 h-4 w-4" />
                          <span>
                            {entry.startTime}
                            {entry.endTime && ` - ${entry.endTime}`}
                            {entry.isActive && ' (pågår)'}
                          </span>
                          {entry.location && (
                            <>
                              <MapPin className="flex-shrink-0 ml-4 mr-1.5 h-4 w-4" />
                              <span>Lokation registreret</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    {entry.totalHours ? (
                      <div className="text-right">
                        <div className="text-lg font-semibold text-gray-900">{entry.totalHours}t</div>
                        <div className="text-sm text-gray-500">Afsluttet</div>
                      </div>
                    ) : (
                      <div className="text-right">
                        <div className="text-lg font-semibold text-blue-600">Pågår...</div>
                        <div className="text-sm text-gray-500">Aktiv</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </li>
          ))}
          
          {todayEntries.length === 0 && (
            <li>
              <div className="px-4 py-12 text-center">
                <Clock className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Ingen tidsregistreringer</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Der er ingen tidsregistreringer for den valgte dato.
                </p>
              </div>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}