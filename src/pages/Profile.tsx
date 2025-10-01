import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Mail, 
  Calendar, 
  Heart, 
  Activity, 
  Settings, 
  Camera, 
  Edit3, 
  Save, 
  X,
  Award,
  Target,
  TrendingUp,
  Clock,
  Star,
  Shield,
  Bell,
  Palette,
  Globe,
  Smartphone
} from "lucide-react";
import { getProfile, upsertProfile, API_BASE_URL } from "@/lib/api";
import BackButton from "@/components/BackButton";
import SavedQuestionnaireDisplay from "@/components/SavedQuestionnaireDisplay";
import SavedRoutinesDisplay from "@/components/SavedRoutinesDisplay";

const Profile = () => {
  const { user } = useAuth();
  const userId = user?.id || "guest";
  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState<string | number>("");
  const [gender, setGender] = useState("");
  const [skinType, setSkinType] = useState("");
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [preferences, setPreferences] = useState({
    notifications: true,
    darkMode: false,
    language: "en",
    timezone: "UTC"
  });

  useEffect(() => {
    if (!userId) return;
    getProfile(userId).then((p) => {
      if (!p) return;
      setProfileData(p);
      setFullName(p.fullName || "");
      setAge(p.age || "");
      setGender(p.gender || "");
      setSkinType(p.skinType || "");
      setAvatarUrl(p.avatarUrl || "");
    }).catch(() => {});
  }, [userId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await upsertProfile(userId, { 
        userId, 
        fullName, 
        age: age ? Number(age) : undefined, 
        gender, 
        skinType,
        avatarUrl,
        preferences
      });
      setIsEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset to original values
    if (profileData) {
      setFullName(profileData.fullName || "");
      setAge(profileData.age || "");
      setGender(profileData.gender || "");
      setSkinType(profileData.skinType || "");
      setAvatarUrl(profileData.avatarUrl || "");
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getProfileCompletion = () => {
    const fields = [fullName, age, gender, skinType];
    const completed = fields.filter(field => field && field.toString().trim() !== '').length;
    return Math.round((completed / fields.length) * 100);
  };

  const getSkinTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      'oily': 'bg-blue-100 text-blue-800',
      'dry': 'bg-orange-100 text-orange-800',
      'combination': 'bg-purple-100 text-purple-800',
      'sensitive': 'bg-pink-100 text-pink-800',
      'normal': 'bg-green-100 text-green-800'
    };
    return colors[type?.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setAvatarFile(file);
    
    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);

    // Upload to server
    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      formData.append('userId', userId);

      const response = await fetch(`${API_BASE_URL}/api/profile/avatar`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setAvatarUrl(result.avatarUrl);
        // Update profile data
        setProfileData(prev => ({ ...prev, avatarUrl: result.avatarUrl }));
      } else {
        throw new Error('Failed to upload avatar');
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert('Failed to upload avatar. Please try again.');
      // Reset on error
      setAvatarFile(null);
      setAvatarPreview("");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const removeAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview("");
    setAvatarUrl("");
    // Reset file input
    const fileInput = document.getElementById('avatar-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  return (
    <div className="min-h-screen bg-background">
      <BackButton />
      <section className="container mx-auto px-4 py-10">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Profile Header */}
          <Card className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 border-0 shadow-2xl text-white overflow-hidden">
            {/* <div className="absolute inset-0 "></div> */}
            <CardContent className="relative p-8">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="relative">
                  <Avatar className="w-24 h-24 border-4 border-white/30 shadow-xl">
                    <AvatarImage src={avatarPreview || avatarUrl} alt={fullName} />
                    <AvatarFallback className="text-2xl font-bold bg-white/20 text-white">
                      {getInitials(fullName || user?.email || "U")}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <div className="absolute -bottom-2 -right-2 flex gap-1">
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                      />
                      <Button
                        size="sm"
                        className="bg-white text-gray-800 hover:bg-gray-100 shadow-lg"
                        onClick={() => document.getElementById('avatar-upload')?.click()}
                        disabled={uploadingAvatar}
                      >
                        {uploadingAvatar ? (
                          <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                        ) : (
                          <Camera className="w-4 h-4" />
                        )}
                      </Button>
                      {(avatarPreview || avatarUrl) && (
                        <Button
                          size="sm"
                          className="bg-red-500 text-white hover:bg-red-600 shadow-lg"
                          onClick={removeAvatar}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="flex-1 space-y-4">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">
                      {fullName || "Complete Your Profile"}
                    </h1>
                    <div className="flex items-center gap-2 text-white/80">
                      <Mail className="w-4 h-4" />
                      <span>{user?.email || "guest@local"}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {skinType && (
                      <Badge className={`${getSkinTypeColor(skinType)} border-0`}>
                        <Palette className="w-3 h-3 mr-1" />
                        {skinType}
                      </Badge>
                    )}
                    {age && (
                      <Badge className="bg-white/20 text-white border-0">
                        <Calendar className="w-3 h-3 mr-1" />
                        {age} years old
                      </Badge>
                    )}
                    {gender && (
                      <Badge className="bg-white/20 text-white border-0">
                        <User className="w-3 h-3 mr-1" />
                        {gender}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex gap-3">
                    {!isEditing ? (
                      <Button
                        onClick={() => setIsEditing(true)}
                        className="bg-white/20 hover:bg-white/30 text-white border border-white/30"
                      >
                        <Edit3 className="w-4 h-4 mr-2" />
                        Edit Profile
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          onClick={handleSave}
                          disabled={saving}
                          className="bg-white text-gray-800 hover:bg-gray-100"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          {saving ? "Saving..." : "Save Changes"}
                        </Button>
                        <Button
                          onClick={handleCancel}
                          variant="outline"
                          className="border-white/30 text-white hover:bg-white/10"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {getProfileCompletion()}%
                </div>
                <div className="text-sm text-gray-600">Profile Complete</div>
                <Progress value={getProfileCompletion()} className="mt-3" />
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {profileData?.savedRoutines?.length || 0}
                </div>
                <div className="text-sm text-gray-600">Saved Routines</div>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {profileData?.questionnaireAnswers ? Object.keys(profileData.questionnaireAnswers).length : 0}
                </div>
                <div className="text-sm text-gray-600">Completed Surveys</div>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {profileData?.createdAt ? Math.floor((Date.now() - new Date(profileData.createdAt).getTime()) / (1000 * 60 * 60 * 24)) : 0}
                </div>
                <div className="text-sm text-gray-600">Days Active</div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="basic" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-white shadow-lg">
              <TabsTrigger value="basic" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Basic Info
              </TabsTrigger>
              <TabsTrigger value="questionnaires" className="flex items-center gap-2">
                <Heart className="w-4 h-4" />
                Health Data
              </TabsTrigger>
              <TabsTrigger value="routines" className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Routines
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Settings
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic">
              <Card className="bg-white border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Personal Information
                  </CardTitle>
                  <CardDescription>Manage your basic profile information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="fullName" className="text-sm font-medium">Full Name</Label>
                      <Input 
                        id="fullName" 
                        value={fullName} 
                        onChange={(e) => setFullName(e.target.value)}
                        disabled={!isEditing}
                        className="text-selectable"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="age" className="text-sm font-medium">Age</Label>
                      <Input 
                        id="age" 
                        type="number" 
                        value={age} 
                        onChange={(e) => setAge(e.target.value)}
                        disabled={!isEditing}
                        className="text-selectable"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="gender" className="text-sm font-medium">Gender</Label>
                      <Input 
                        id="gender" 
                        value={gender} 
                        onChange={(e) => setGender(e.target.value)}
                        disabled={!isEditing}
                        className="text-selectable"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="skinType" className="text-sm font-medium">Skin Type</Label>
                      <Input 
                        id="skinType" 
                        value={skinType} 
                        onChange={(e) => setSkinType(e.target.value)}
                        disabled={!isEditing}
                        className="text-selectable"
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Profile Completion</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Profile Progress</span>
                        <span>{getProfileCompletion()}%</span>
                      </div>
                      <Progress value={getProfileCompletion()} className="h-2" />
                    </div>
                    <div className="text-sm text-gray-600">
                      Complete your profile to get personalized recommendations and better insights.
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="questionnaires">
              <SavedQuestionnaireDisplay />
            </TabsContent>
            
            <TabsContent value="routines">
              <SavedRoutinesDisplay />
            </TabsContent>

            <TabsContent value="settings">
              <Card className="bg-white border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Preferences & Settings
                  </CardTitle>
                  <CardDescription>Customize your experience</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Notifications</h3>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Bell className="w-5 h-5 text-gray-600" />
                        <div>
                          <div className="font-medium">Push Notifications</div>
                          <div className="text-sm text-gray-600">Get notified about routine reminders</div>
                        </div>
                      </div>
                      <Button
                        variant={preferences.notifications ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPreferences(prev => ({ ...prev, notifications: !prev.notifications }))}
                      >
                        {preferences.notifications ? "On" : "Off"}
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Appearance</h3>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Palette className="w-5 h-5 text-gray-600" />
                        <div>
                          <div className="font-medium">Dark Mode</div>
                          <div className="text-sm text-gray-600">Switch to dark theme</div>
                        </div>
                      </div>
                      <Button
                        variant={preferences.darkMode ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPreferences(prev => ({ ...prev, darkMode: !prev.darkMode }))}
                      >
                        {preferences.darkMode ? "On" : "Off"}
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Account</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Shield className="w-5 h-5 text-gray-600" />
                          <div>
                            <div className="font-medium">Account Security</div>
                            <div className="text-sm text-gray-600">Manage your account security</div>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          Manage
                        </Button>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Globe className="w-5 h-5 text-gray-600" />
                          <div>
                            <div className="font-medium">Language & Region</div>
                            <div className="text-sm text-gray-600">English (US) • UTC</div>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          Change
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
};

export default Profile;


