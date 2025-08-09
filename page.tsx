"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { db, collection, doc, setDoc, updateDoc, deleteDoc, getDocs } from "./firebase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Calendar, Clock, BookOpen, Bell, Plus, Trash2, Edit } from "lucide-react"
import { Switch } from "@/components/ui/switch"

interface Subject {
  id: string
  name: string
  day: string
  startTime: string
  endTime: string
  room: string
  instructor: string
  color: string
}

interface Assignment {
  id: string
  title: string
  subject: string
  dueDate: string
  description: string
  completed: boolean
  priority: "low" | "medium" | "high"
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
const COLORS = [
  "bg-blue-500",
  "bg-green-500",
  "bg-purple-500",
  "bg-red-500",
  "bg-yellow-500",
  "bg-pink-500",
  "bg-indigo-500",
]

export default function StudentScheduleApp() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [selectedDay, setSelectedDay] = useState(DAYS[new Date().getDay() - 1] || "Monday")
  const [isAddingSubject, setIsAddingSubject] = useState(false)
  const [isAddingAssignment, setIsAddingAssignment] = useState(false)
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null)

  // --- Firestore CRUD for Subjects ---
  const subjectsCollection = collection(db, "subjects")

  useEffect(() => {
    const fetchSubjects = async () => {
      const snapshot = await getDocs(subjectsCollection)
      const subjectsData = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      })) as Subject[]
      setSubjects(subjectsData)
    }
    fetchSubjects()
  }, [])

  const addSubject = async (subjectData: Omit<Subject, "id">) => {
    const newDocRef = doc(subjectsCollection)
    const newSubject: Subject = { ...subjectData, id: newDocRef.id }
    await setDoc(newDocRef, newSubject)
    setSubjects((prev) => [...prev, newSubject])
    setIsAddingSubject(false)
  }

  const updateSubject = async (updatedSubject: Subject) => {
    const subjectRef = doc(db, "subjects", updatedSubject.id)
    const { id, ...subjectData } = updatedSubject
    await updateDoc(subjectRef, subjectData)
    setSubjects((prev) => prev.map((s) => (s.id === updatedSubject.id ? updatedSubject : s)))
    setEditingSubject(null)
  }

  const deleteSubject = async (id: string) => {
    const subjectRef = doc(db, "subjects", id)
    await deleteDoc(subjectRef)
    setSubjects((prev) => prev.filter((s) => s.id !== id))
  }

  // --- Firestore CRUD for Assignments ---
  const assignmentsCollection = collection(db, "assignments")

  useEffect(() => {
    const fetchAssignments = async () => {
      const snapshot = await getDocs(assignmentsCollection)
      const assignmentsData = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      })) as Assignment[]
      setAssignments(assignmentsData)
    }
    fetchAssignments()
  }, [])

  const addAssignment = async (assignmentData: Omit<Assignment, "id">) => {
    const newDocRef = doc(assignmentsCollection)
    const newAssignment: Assignment = { ...assignmentData, id: newDocRef.id }
    await setDoc(newDocRef, newAssignment)
    setAssignments((prev) => [...prev, newAssignment])
    setIsAddingAssignment(false)
  }

  const toggleAssignmentComplete = async (id: string) => {
    const assignment = assignments.find((a) => a.id === id)
    if (!assignment) return
    const assignmentRef = doc(db, "assignments", id)
    await updateDoc(assignmentRef, { completed: !assignment.completed })
    setAssignments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, completed: !a.completed } : a))
    )
  }

  const deleteAssignment = async (id: string) => {
    const assignmentRef = doc(db, "assignments", id)
    await deleteDoc(assignmentRef)
    setAssignments((prev) => prev.filter((a) => a.id !== id))
  }

  const getTodaysSubjects = () => {
    return subjects
      .filter((subject) => subject.day === selectedDay)
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
  }

  const getUpcomingAssignments = () => {
    const today = new Date()
    return assignments
      .filter((a) => !a.completed && new Date(a.dueDate) >= today)
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 5)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500"
      case "medium":
        return "bg-yellow-500"
      case "low":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Student Schedule Manager</h1>
          <p className="text-gray-600">Manage your classes, assignments, and stay on top of your academic schedule: app by tejas, jaidev and sherwin</p>
        </header>

        <Tabs defaultValue="schedule" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="reminders">Reminders</TabsTrigger>
          </TabsList>

          <TabsContent value="schedule" className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex items-center gap-4">
                <Label htmlFor="day-select">Select Day:</Label>
                <Select value={selectedDay} onValueChange={setSelectedDay}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DAYS.map((day) => (
                      <SelectItem key={day} value={day}>
                        {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Dialog open={isAddingSubject} onOpenChange={setIsAddingSubject}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Subject
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Subject</DialogTitle>
                  </DialogHeader>
                  <SubjectForm onSubmit={addSubject} />
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {getTodaysSubjects().length === 0 ? (
                <Card>
                  <CardContent className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No classes scheduled for {selectedDay}</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                getTodaysSubjects().map((subject) => (
                  <Card key={subject.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-4 h-4 rounded-full ${subject.color}`} />
                          <div>
                            <h3 className="font-semibold text-lg">{subject.name}</h3>
                            <p className="text-gray-600">{subject.instructor}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {subject.startTime} - {subject.endTime}
                              </span>
                              <span>{subject.room}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => setEditingSubject(subject)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => deleteSubject(subject.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="assignments" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Assignments</h2>
              <Dialog open={isAddingAssignment} onOpenChange={setIsAddingAssignment}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Assignment
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Assignment</DialogTitle>
                  </DialogHeader>
                  <AssignmentForm onSubmit={addAssignment} subjects={subjects} />
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {getUpcomingAssignments().length === 0 ? (
                <Card>
                  <CardContent className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No upcoming assignments</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                getUpcomingAssignments().map((assignment) => (
                  <Card key={assignment.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <input
                            type="checkbox"
                            checked={assignment.completed}
                            onChange={() => toggleAssignmentComplete(assignment.id)}
                            className="w-4 h-4"
                          />
                          <div className={assignment.completed ? "opacity-50" : ""}>
                            <h3 className="font-semibold">{assignment.title}</h3>
                            <p className="text-gray-600">{assignment.subject}</p>
                            <p className="text-sm text-gray-500">{assignment.description}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline">Due: {new Date(assignment.dueDate).toLocaleDateString()}</Badge>
                              <Badge className={getPriorityColor(assignment.priority)}>{assignment.priority}</Badge>
                            </div>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => deleteAssignment(assignment.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="reminders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Reminder Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Class Reminders</p>
                    <p className="text-sm text-gray-500">Get notified 15 minutes before each class</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Assignment Reminders</p>
                    <p className="text-sm text-gray-500">Get notified 1 day before assignment due dates</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Daily Schedule</p>
                    <p className="text-sm text-gray-500">Receive your daily schedule every morning at 8 AM</p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upcoming Reminders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getTodaysSubjects()
                    .slice(0, 3)
                    .map((subject) => (
                      <div key={subject.id} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                        <Bell className="w-4 h-4 text-blue-600" />
                        <div>
                          <p className="font-medium">{subject.name}</p>
                          <p className="text-sm text-gray-600">Starts at {subject.startTime}</p>
                        </div>
                      </div>
                    ))}
                  {getUpcomingAssignments()
                    .slice(0, 2)
                    .map((assignment) => (
                      <div key={assignment.id} className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                        <Calendar className="w-4 h-4 text-yellow-600" />
                        <div>
                          <p className="font-medium">{assignment.title}</p>
                          <p className="text-sm text-gray-600">
                            Due {new Date(assignment.dueDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Edit Subject Dialog */}
        <Dialog open={!!editingSubject} onOpenChange={() => setEditingSubject(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Subject</DialogTitle>
            </DialogHeader>
            {editingSubject && <SubjectForm initialData={editingSubject} onSubmit={updateSubject} isEditing />}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

function SubjectForm({
  onSubmit,
  initialData,
  isEditing = false,
}: {
  onSubmit: (data: any) => void
  initialData?: Subject
  isEditing?: boolean
}) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    day: initialData?.day || "Monday",
    startTime: initialData?.startTime || "",
    endTime: initialData?.endTime || "",
    room: initialData?.room || "",
    instructor: initialData?.instructor || "",
    color: initialData?.color || COLORS[0],
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isEditing && initialData) {
      onSubmit({ ...initialData, ...formData })
    } else {
      onSubmit(formData)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Subject Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div>
        <Label htmlFor="day">Day</Label>
        <Select value={formData.day} onValueChange={(value) => setFormData({ ...formData, day: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DAYS.map((day) => (
              <SelectItem key={day} value={day}>
                {day}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="startTime">Start Time</Label>
          <Input
            id="startTime"
            type="time"
            value={formData.startTime}
            onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="endTime">End Time</Label>
          <Input
            id="endTime"
            type="time"
            value={formData.endTime}
            onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="room">Room</Label>
        <Input
          id="room"
          value={formData.room}
          onChange={(e) => setFormData({ ...formData, room: e.target.value })}
          required
        />
      </div>

      <div>
        <Label htmlFor="instructor">Instructor</Label>
        <Input
          id="instructor"
          value={formData.instructor}
          onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
          required
        />
      </div>

      <div>
        <Label>Color</Label>
        <div className="flex gap-2 mt-2">
          {COLORS.map((color) => (
            <button
              key={color}
              type="button"
              className={`w-8 h-8 rounded-full ${color} ${formData.color === color ? "ring-2 ring-gray-400" : ""}`}
              onClick={() => setFormData({ ...formData, color })}
            />
          ))}
        </div>
      </div>

      <Button type="submit" className="w-full">
        {isEditing ? "Update Subject" : "Add Subject"}
      </Button>
    </form>
  )
}

function AssignmentForm({
  onSubmit,
  subjects,
}: {
  onSubmit: (data: any) => void
  subjects: Subject[]
}) {
  const [formData, setFormData] = useState({
    title: "",
    subject: "",
    dueDate: "",
    description: "",
    completed: false,
    priority: "medium" as "low" | "medium" | "high",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
    setFormData({
      title: "",
      subject: "",
      dueDate: "",
      description: "",
      completed: false,
      priority: "medium",
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Assignment Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>

      <div>
        <Label htmlFor="subject">Subject</Label>
        <Select value={formData.subject} onValueChange={(value) => setFormData({ ...formData, subject: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select a subject" />
          </SelectTrigger>
          <SelectContent>
            {subjects.map((subject) => (
              <SelectItem key={subject.id} value={subject.name}>
                {subject.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="dueDate">Due Date</Label>
        <Input
          id="dueDate"
          type="date"
          value={formData.dueDate}
          onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
          required
        />
      </div>

      <div>
        <Label htmlFor="priority">Priority</Label>
        <Select
          value={formData.priority}
          onValueChange={(value: "low" | "medium" | "high") => setFormData({ ...formData, priority: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
        />
      </div>

      <Button type="submit" className="w-full">
        Add Assignment
      </Button>
    </form>
  )
}
