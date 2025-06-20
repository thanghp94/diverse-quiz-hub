import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Edit, Save, X, Users, BookOpen, FileText, HelpCircle, Target, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';

interface User {
  id: string;
  first_name: string;
  last_name: string;
  full_name?: string;
  meraki_email?: string;
  category?: string;
}

interface Topic {
  id: string;
  topic: string;
  short_summary?: string;
  challengesubject?: string;
  image?: string;
  parentid?: string;
  showstudent?: boolean;
}

interface Content {
  id: string;
  topicid: string;
  title?: string;
  short_blurb?: string;
  information?: string;
  prompt?: string;
}

interface Question {
  id: string;
  contentid: string;
  topicid?: string;
  question: string;
  level?: string;
  type?: string;
}

interface Match {
  id: string;
  type?: string;
  subject?: string;
  topic?: string;
  description?: string;
  topicid: string;
  created_at?: string;
}

type ActiveTab = 'students' | 'topics' | 'content' | 'questions' | 'matching';

const AdminPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<ActiveTab>('students');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newItemData, setNewItemData] = useState<any>({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch data based on active tab
  const { data: students, isLoading: studentsLoading } = useQuery({
    queryKey: ['/api/users'],
    enabled: activeTab === 'students'
  });

  const { data: topics, isLoading: topicsLoading } = useQuery({
    queryKey: ['/api/topics'],
    enabled: activeTab === 'topics'
  });

  const { data: content, isLoading: contentLoading } = useQuery({
    queryKey: ['/api/content'],
    enabled: activeTab === 'content'
  });

  const { data: questions, isLoading: questionsLoading } = useQuery({
    queryKey: ['/api/questions'],
    enabled: activeTab === 'questions'
  });

  const { data: matching, isLoading: matchingLoading } = useQuery({
    queryKey: ['/api/matching'],
    enabled: activeTab === 'matching'
  });

  // Check admin access
  const isAdmin = user?.id === 'GV0002';

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto">
            <CardContent className="text-center py-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
              <p className="text-gray-600">You don't have permission to access this page.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Update mutations
  const updateUser = useMutation({
    mutationFn: async (userData: User) => {
      const response = await fetch(`/api/users/${userData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to update user');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      setEditingId(null);
      toast({ title: "Success", description: "User updated successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update user", variant: "destructive" });
    }
  });

  const updateTopic = useMutation({
    mutationFn: async (topicData: Topic) => {
      const response = await fetch(`/api/topics/${topicData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(topicData),
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to update topic');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/topics'] });
      setEditingId(null);
      toast({ title: "Success", description: "Topic updated successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update topic", variant: "destructive" });
    }
  });

  // Create mutations
  const createUser = useMutation({
    mutationFn: async (userData: any) => {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to create user');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      setShowAddDialog(false);
      setNewItemData({});
      toast({ title: "Success", description: "User created successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create user", variant: "destructive" });
    }
  });

  const createTopic = useMutation({
    mutationFn: async (topicData: any) => {
      const response = await fetch('/api/topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(topicData),
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to create topic');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/topics'] });
      setShowAddDialog(false);
      setNewItemData({});
      toast({ title: "Success", description: "Topic created successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create topic", variant: "destructive" });
    }
  });

  const createContent = useMutation({
    mutationFn: async (contentData: any) => {
      const response = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contentData),
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to create content');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/content'] });
      setShowAddDialog(false);
      setNewItemData({});
      toast({ title: "Success", description: "Content created successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create content", variant: "destructive" });
    }
  });

  const createMatching = useMutation({
    mutationFn: async (matchingData: any) => {
      const response = await fetch('/api/matching', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(matchingData),
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to create matching');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/matching'] });
      setShowAddDialog(false);
      setNewItemData({});
      toast({ title: "Success", description: "Matching activity created successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create matching activity", variant: "destructive" });
    }
  });

  // Filter data based on search
  const getFilteredData = () => {
    const term = searchTerm.toLowerCase();
    switch (activeTab) {
      case 'students':
        return (students as User[])?.filter(s => 
          // Show all users that look like students (have HS prefix or email)
          (s.id?.startsWith('HS') || s.meraki_email?.includes('student') || s.meraki_email?.includes('@meraki.edu')) &&
          (s.full_name?.toLowerCase().includes(term) || 
           s.first_name?.toLowerCase().includes(term) ||
           s.last_name?.toLowerCase().includes(term) ||
           s.id?.toLowerCase().includes(term) ||
           s.meraki_email?.toLowerCase().includes(term))
        ) || [];
      case 'topics':
        return (topics as Topic[])?.filter(t => 
          t.topic?.toLowerCase().includes(term) ||
          t.id?.toLowerCase().includes(term)
        ) || [];
      case 'content':
        return (content as Content[])?.filter(c => 
          c.title?.toLowerCase().includes(term) ||
          c.short_blurb?.toLowerCase().includes(term) ||
          c.id?.toLowerCase().includes(term)
        ) || [];
      case 'questions':
        return (questions as Question[])?.filter(q => 
          q.question?.toLowerCase().includes(term) ||
          q.id?.toLowerCase().includes(term)
        ) || [];
      case 'matching':
        return (matching as Match[])?.filter(m => 
          m.topic?.toLowerCase().includes(term) ||
          m.subject?.toLowerCase().includes(term) ||
          m.description?.toLowerCase().includes(term) ||
          m.id?.toLowerCase().includes(term)
        ) || [];
      default:
        return [];
    }
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setEditData(item);
  };

  const handleSave = () => {
    if (activeTab === 'students') {
      updateUser.mutate(editData);
    } else if (activeTab === 'topics') {
      updateTopic.mutate(editData);
    } else if (activeTab === 'content') {
      // Content update mutation can be added here if needed
      toast({ title: "Info", description: "Content editing will be implemented", variant: "default" });
      setEditingId(null);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleCreate = () => {
    if (activeTab === 'students') {
      // Check for duplicate ID or Meraki email
      const existingUserWithId = (students as User[])?.find(user => user.id === newItemData.id);
      const existingUserWithEmail = (students as User[])?.find(user => user.meraki_email === newItemData.meraki_email);
      
      if (existingUserWithId) {
        toast({
          title: "Error",
          description: `Student ID "${newItemData.id}" is already in use. Please choose a different ID.`,
          variant: "destructive"
        });
        return;
      }
      
      if (newItemData.meraki_email && existingUserWithEmail) {
        toast({
          title: "Error", 
          description: `Meraki email "${newItemData.meraki_email}" is already in use. Please choose a different email.`,
          variant: "destructive"
        });
        return;
      }
      
      createUser.mutate(newItemData);
    } else if (activeTab === 'topics') {
      createTopic.mutate(newItemData);
    } else if (activeTab === 'content') {
      createContent.mutate(newItemData);
    } else if (activeTab === 'matching') {
      createMatching.mutate(newItemData);
    }
  };

  const getAddDialogContent = () => {
    switch (activeTab) {
      case 'students':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="id">Student ID</Label>
              <Input
                id="id"
                value={newItemData.id || ''}
                onChange={(e) => setNewItemData({...newItemData, id: e.target.value})}
                placeholder="HS0001"
              />
            </div>
            <div>
              <Label htmlFor="email">Meraki Email</Label>
              <Input
                id="email"
                value={newItemData.meraki_email || ''}
                onChange={(e) => setNewItemData({...newItemData, meraki_email: e.target.value})}
                placeholder="student@meraki.edu"
              />
            </div>
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={newItemData.full_name || ''}
                onChange={(e) => setNewItemData({...newItemData, full_name: e.target.value})}
                placeholder="John Doe"
              />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Select
                value={newItemData.category || "student"}
                onValueChange={(value) => setNewItemData({...newItemData, category: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">student</SelectItem>
                  <SelectItem value="teacher">teacher</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="show">Show</Label>
              <Select
                value={newItemData.show || "challenge"}
                onValueChange={(value) => setNewItemData({...newItemData, show: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="challenge">challenge</SelectItem>
                  <SelectItem value="challenge, writing, debate">challenge, writing, debate</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      case 'topics':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="topic">Topic Name</Label>
              <Input
                id="topic"
                value={newItemData.topic || ''}
                onChange={(e) => setNewItemData({...newItemData, topic: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="summary">Short Summary</Label>
              <Textarea
                id="summary"
                value={newItemData.short_summary || ''}
                onChange={(e) => setNewItemData({...newItemData, short_summary: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="challengeSubject">Challenge Subject</Label>
              <Input
                id="challengeSubject"
                value={newItemData.challengesubject || ''}
                onChange={(e) => setNewItemData({...newItemData, challengesubject: e.target.value})}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="showStudent"
                checked={newItemData.showstudent || false}
                onCheckedChange={(checked) => setNewItemData({...newItemData, showstudent: checked})}
              />
              <Label htmlFor="showStudent">Show to Students</Label>
            </div>
          </div>
        );
      case 'content':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={newItemData.title || ''}
                onChange={(e) => setNewItemData({...newItemData, title: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="topicId">Topic ID</Label>
              <Input
                id="topicId"
                value={newItemData.topicid || ''}
                onChange={(e) => setNewItemData({...newItemData, topicid: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="shortBlurb">Short Blurb</Label>
              <Textarea
                id="shortBlurb"
                value={newItemData.short_blurb || ''}
                onChange={(e) => setNewItemData({...newItemData, short_blurb: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="information">Information</Label>
              <Textarea
                id="information"
                value={newItemData.information || ''}
                onChange={(e) => setNewItemData({...newItemData, information: e.target.value})}
              />
            </div>
          </div>
        );
      case 'matching':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="type">Type</Label>
              <Input
                id="type"
                value={newItemData.type || ''}
                onChange={(e) => setNewItemData({...newItemData, type: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={newItemData.subject || ''}
                onChange={(e) => setNewItemData({...newItemData, subject: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="topic">Topic</Label>
              <Input
                id="topic"
                value={newItemData.topic || ''}
                onChange={(e) => setNewItemData({...newItemData, topic: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="topicId">Topic ID</Label>
              <Input
                id="topicId"
                value={newItemData.topicid || ''}
                onChange={(e) => setNewItemData({...newItemData, topicid: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newItemData.description || ''}
                onChange={(e) => setNewItemData({...newItemData, description: e.target.value})}
              />
            </div>
          </div>
        );
      default:
        return <div>No form available</div>;
    }
  };

  const tabs = [
    { id: 'students', label: 'Students', icon: Users, color: 'bg-blue-500' },
    { id: 'topics', label: 'Topics', icon: BookOpen, color: 'bg-green-500' },
    { id: 'content', label: 'Content', icon: FileText, color: 'bg-purple-500' },
    { id: 'questions', label: 'Questions', icon: HelpCircle, color: 'bg-orange-500' },
    { id: 'matching', label: 'Matching', icon: Target, color: 'bg-red-500' }
  ];

  const isLoading = studentsLoading || topicsLoading || contentLoading || questionsLoading || matchingLoading;
  const filteredData = getFilteredData();
  
  // Pagination calculations
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  // Reset current page when switching tabs or searching
  React.useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchTerm]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage system data and settings</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <Button
                key={tab.id}
                variant={isActive ? "default" : "outline"}
                onClick={() => setActiveTab(tab.id as ActiveTab)}
                className={`flex items-center gap-2 ${isActive ? `${tab.color} text-white` : 'bg-white text-gray-700 border-gray-300'}`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </Button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Data Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {tabs.find(t => t.id === activeTab)?.icon && 
                  React.createElement(tabs.find(t => t.id === activeTab)!.icon, { className: "h-5 w-5" })
                }
                {tabs.find(t => t.id === activeTab)?.label}
                <Badge variant="secondary" className="ml-2">
                  {filteredData.length} items
                </Badge>
              </div>
              <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add {tabs.find(t => t.id === activeTab)?.label.slice(0, -1)}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add New {tabs.find(t => t.id === activeTab)?.label.slice(0, -1)}</DialogTitle>
                  </DialogHeader>
                  {getAddDialogContent()}
                  <div className="flex gap-2 mt-4">
                    <Button onClick={handleCreate} disabled={createUser.isPending || createTopic.isPending || createContent.isPending || createMatching.isPending}>
                      Create
                    </Button>
                    <Button variant="outline" onClick={() => {setShowAddDialog(false); setNewItemData({});}}>
                      Cancel
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading...</div>
            ) : filteredData.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No data found</div>
            ) : (
              <div className="overflow-x-auto">
                {activeTab === 'students' && (
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3">ID</th>
                        <th className="text-left p-3">Meraki Email</th>
                        <th className="text-left p-3">Category</th>
                        <th className="text-left p-3">Show</th>
                        <th className="text-left p-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedData.map((student: User) => (
                        <tr key={student.id} className="border-b hover:bg-gray-50">
                          <td className="p-3">{student.id}</td>
                          <td className="p-3">
                            {editingId === student.id ? (
                              <Input
                                value={editData.meraki_email || ''}
                                onChange={(e) => setEditData({...editData, meraki_email: e.target.value})}
                                className="w-full"
                              />
                            ) : (
                              student.meraki_email || 'N/A'
                            )}
                          </td>
                          <td className="p-3">
                            {editingId === student.id ? (
                              <Input
                                value={editData.category || ''}
                                onChange={(e) => setEditData({...editData, category: e.target.value})}
                                className="w-full"
                              />
                            ) : (
                              <Badge variant="secondary">{student.category || 'Unknown'}</Badge>
                            )}
                          </td>
                          <td className="p-3">
                            <Badge variant={student.show ? "default" : "secondary"}>
                              {student.show ? 'Yes' : 'No'}
                            </Badge>
                          </td>
                          <td className="p-3">
                            {editingId === student.id ? (
                              <div className="flex gap-2">
                                <Button size="sm" onClick={handleSave} disabled={updateUser.isPending}>
                                  <Save className="h-3 w-3" />
                                </Button>
                                <Button size="sm" variant="outline" onClick={handleCancel}>
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ) : (
                              <Button size="sm" variant="outline" onClick={() => handleEdit(student)}>
                                <Edit className="h-3 w-3" />
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {activeTab === 'topics' && (
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3">Topic</th>
                        <th className="text-left p-3">ID</th>
                        <th className="text-left p-3">Summary</th>
                        <th className="text-left p-3">Show Student</th>
                        <th className="text-left p-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedData.map((topic: Topic) => (
                        <tr key={topic.id} className="border-b hover:bg-gray-50">
                          <td className="p-3">
                            {editingId === topic.id ? (
                              <Input
                                value={editData.topic || ''}
                                onChange={(e) => setEditData({...editData, topic: e.target.value})}
                                className="w-full"
                              />
                            ) : (
                              topic.topic
                            )}
                          </td>
                          <td className="p-3 text-sm text-gray-500">{topic.id}</td>
                          <td className="p-3">
                            {editingId === topic.id ? (
                              <Input
                                value={editData.short_summary || ''}
                                onChange={(e) => setEditData({...editData, short_summary: e.target.value})}
                                className="w-full"
                              />
                            ) : (
                              topic.short_summary || 'N/A'
                            )}
                          </td>
                          <td className="p-3">
                            <Badge variant={topic.showstudent ? "default" : "secondary"}>
                              {topic.showstudent ? 'Yes' : 'No'}
                            </Badge>
                          </td>
                          <td className="p-3">
                            {editingId === topic.id ? (
                              <div className="flex gap-2">
                                <Button size="sm" onClick={handleSave} disabled={updateTopic.isPending}>
                                  <Save className="h-3 w-3" />
                                </Button>
                                <Button size="sm" variant="outline" onClick={handleCancel}>
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ) : (
                              <Button size="sm" variant="outline" onClick={() => handleEdit(topic)}>
                                <Edit className="h-3 w-3" />
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {activeTab === 'content' && (
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3">Order</th>
                        <th className="text-left p-3">Title</th>
                        <th className="text-left p-3">Topic ID</th>
                        <th className="text-left p-3">Short Blurb</th>
                        <th className="text-left p-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedData.map((item: Content, index: number) => (
                        <tr key={item.id} className="border-b hover:bg-gray-50">
                          <td className="p-3 text-center">{startIndex + index + 1}</td>
                          <td className="p-3">{item.title || 'Untitled'}</td>
                          <td className="p-3 text-sm text-gray-500">{item.topicid}</td>
                          <td className="p-3 max-w-xs truncate">{item.short_blurb || 'N/A'}</td>
                          <td className="p-3">
                            <Button size="sm" variant="outline" onClick={() => handleEdit(item)}>
                              <Edit className="h-3 w-3" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {activeTab === 'questions' && (
                  <div>
                    {filteredData.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <p>No questions found in the database.</p>
                        <p className="text-sm mt-2">Questions may be stored in a different table or format.</p>
                      </div>
                    ) : (
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-3">Question</th>
                            <th className="text-left p-3">Level</th>
                            <th className="text-left p-3">Type</th>
                            <th className="text-left p-3">Content ID</th>
                            <th className="text-left p-3">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedData.map((question: Question) => (
                            <tr key={question.id} className="border-b hover:bg-gray-50">
                              <td className="p-3 max-w-md truncate">{question.question}</td>
                              <td className="p-3">
                                <Badge variant="secondary">{question.level || 'N/A'}</Badge>
                              </td>
                              <td className="p-3">
                                <Badge variant="outline">{question.type || 'N/A'}</Badge>
                              </td>
                              <td className="p-3 text-sm text-gray-500">{question.contentid}</td>
                              <td className="p-3">
                                <Button size="sm" variant="outline" onClick={() => handleEdit(question)}>
                                  <Edit className="h-3 w-3" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}

                {activeTab === 'matching' && (
                  <div>
                    {filteredData.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <p>No matching activities found in the database.</p>
                        <p className="text-sm mt-2">The matching table is currently empty. Create some matching activities to see them here.</p>
                        <p className="text-sm mt-1 text-blue-600">Use the "Add Matching" button above to create your first matching activity.</p>
                      </div>
                    ) : (
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-3">Topic</th>
                            <th className="text-left p-3">Subject</th>
                            <th className="text-left p-3">Type</th>
                            <th className="text-left p-3">Description</th>
                            <th className="text-left p-3">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedData.map((match: Match) => (
                            <tr key={match.id} className="border-b hover:bg-gray-50">
                              <td className="p-3">{match.topic || 'N/A'}</td>
                              <td className="p-3">{match.subject || 'N/A'}</td>
                              <td className="p-3">
                                <Badge variant="secondary">{match.type || 'N/A'}</Badge>
                              </td>
                              <td className="p-3 max-w-xs truncate">{match.description || 'N/A'}</td>
                              <td className="p-3">
                                <Button size="sm" variant="outline" onClick={() => handleEdit(match)}>
                                  <Edit className="h-3 w-3" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
              </div>
            )}
            
            {/* Pagination Controls */}
            {filteredData.length > itemsPerPage && (
              <div className="flex items-center justify-between mt-4 px-4 py-3 border-t">
                <div className="text-sm text-gray-500">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredData.length)} of {filteredData.length} results
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(pageNum)}
                          className="w-8 h-8 p-0"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminPage;