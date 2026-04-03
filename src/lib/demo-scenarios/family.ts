export const familyScenario = {
  name: "Family Manager",
  description: "Household coordination, school activities, groceries, and family calendar",
  data: {
    householdTasks: [
      { id: "HT-FM01", title: "Grocery run — weekly staples", assignee: "You", due: "Today", priority: "high", status: "pending" },
      { id: "HT-FM02", title: "Schedule HVAC maintenance", assignee: "SITA", due: "This week", priority: "medium", status: "in-progress" },
      { id: "HT-FM03", title: "Soccer uniform wash", assignee: "You", due: "Today", priority: "high", status: "pending" },
      { id: "HT-FM04", title: "Book summer camp", assignee: "You", due: "Apr 15", priority: "high", status: "pending" },
    ],
    familyEvents: [
      { id: "FE-FM01", title: "Soccer Practice", who: "Alex", when: "Today 4:00 PM", location: "Wilson Park" },
      { id: "FE-FM02", title: "Piano Lesson", who: "Maya", when: "Today 5:30 PM", location: "Mrs. Chen's Studio" },
      { id: "FE-FM03", title: "Parent-Teacher Conference", who: "Both", when: "Thu 3:30 PM", location: "Lincoln Elementary" },
      { id: "FE-FM04", title: "Dance Recital", who: "Maya", when: "Sat 2:00 PM", location: "Community Center" },
    ],
    focus: "Coordinate today's activities and plan for the weekend recital",
  },
};
