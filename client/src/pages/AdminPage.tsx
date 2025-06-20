import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Edit, Save, X, Users, BookOpen, FileText, HelpCircle, Target } from 'lucide-react';
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
  topicid: string;
  title: string;
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

  // Filter data based on search
  const getFilteredData = () => {
    const term = searchTerm.toLowerCase();
    switch (activeTab) {
      case 'students':
        return (students as User[])?.filter(s => 
          s.category?.toLowerCase().includes('student') &&
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
          m.title?.toLowerCase().includes(term) ||
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
    }
    // Add other update mutations as needed
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditData({});
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
            <CardTitle className="flex items-center gap-2">
              {tabs.find(t => t.id === activeTab)?.icon && 
                React.createElement(tabs.find(t => t.id === activeTab)!.icon, { className: "h-5 w-5" })
              }
              {tabs.find(t => t.id === activeTab)?.label}
              <Badge variant="secondary" className="ml-2">
                {filteredData.length} items
              </Badge>
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
                        <th className="text-left p-3">Full Name</th>
                        <th className="text-left p-3">ID</th>
                        <th className="text-left p-3">Meraki Email</th>
                        <th className="text-left p-3">Category</th>
                        <th className="text-left p-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.map((student: User) => (
                        <tr key={student.id} className="border-b hover:bg-gray-50">
                          <td className="p-3">
                            {editingId === student.id ? (
                              <Input
                                value={editData.full_name || ''}
                                onChange={(e) => setEditData({...editData, full_name: e.target.value})}
                                className="w-full"
                              />
                            ) : (
                              student.full_name || `${student.first_name || ''} ${student.last_name || ''}`.trim()
                            )}
                          </td>
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
                            <Badge variant="secondary">{student.category || 'Unknown'}</Badge>
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
                      {filteredData.map((topic: Topic) => (
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
                        <th className="text-left p-3">Title</th>
                        <th className="text-left p-3">ID</th>
                        <th className="text-left p-3">Topic ID</th>
                        <th className="text-left p-3">Short Blurb</th>
                        <th className="text-left p-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.map((item: Content) => (
                        <tr key={item.id} className="border-b hover:bg-gray-50">
                          <td className="p-3">{item.title || 'Untitled'}</td>
                          <td className="p-3 text-sm text-gray-500">{item.id}</td>
                          <td className="p-3 text-sm text-gray-500">{item.topicid}</td>
                          <td className="p-3 max-w-xs truncate">{item.short_blurb || 'N/A'}</td>
                          <td className="p-3">
                            <Button size="sm" variant="outline">
                              <Edit className="h-3 w-3" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {activeTab === 'questions' && (
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
                      {filteredData.map((question: Question) => (
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
                            <Button size="sm" variant="outline">
                              <Edit className="h-3 w-3" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {activeTab === 'matching' && (
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3">Title</th>
                        <th className="text-left p-3">ID</th>
                        <th className="text-left p-3">Topic ID</th>
                        <th className="text-left p-3">Created</th>
                        <th className="text-left p-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.map((match: Match) => (
                        <tr key={match.id} className="border-b hover:bg-gray-50">
                          <td className="p-3">{match.title}</td>
                          <td className="p-3 text-sm text-gray-500">{match.id}</td>
                          <td className="p-3 text-sm text-gray-500">{match.topicid}</td>
                          <td className="p-3 text-sm text-gray-500">
                            {match.created_at ? new Date(match.created_at).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="p-3">
                            <Button size="sm" variant="outline">
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminPage;