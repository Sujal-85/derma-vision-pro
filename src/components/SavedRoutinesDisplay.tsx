import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Clock,
  Droplets,
  Sun,
  Moon,
  Calendar,
  CheckCircle,
  RefreshCw,
  Eye
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { getSavedRoutines, setActiveRoutine } from "@/lib/api";

const SavedRoutinesDisplay = () => {
  const { user } = useAuth();
  const [savedRoutines, setSavedRoutines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState<string | null>(null);

  useEffect(() => {
    const loadRoutines = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const routines = await getSavedRoutines(user.id);
        setSavedRoutines(routines);
      } catch (error) {
        console.error('Failed to load saved routines:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRoutines();
  }, [user?.id]);

  const handleActivateRoutine = async (routineId: string) => {
    if (!user?.id) return;
    
    setActivating(routineId);
    try {
      await setActiveRoutine(user.id, routineId);
      // Reload routines to update active status
      const routines = await getSavedRoutines(user.id);
      setSavedRoutines(routines);
    } catch (error) {
      console.error('Failed to activate routine:', error);
    } finally {
      setActivating(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Loading saved routines...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Your Saved Routines</h2>
        <p className="text-muted-foreground">
          View and manage your personalized skincare routines
        </p>
      </div>

      {savedRoutines.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Clock className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Saved Routines</h3>
            <p className="text-muted-foreground mb-4">
              You haven't saved any routines yet. Generate a routine to get started!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {savedRoutines.map((routine) => (
            <Card key={routine.id} className={routine.isActive ? 'ring-2 ring-primary' : ''}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Clock className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <span>{routine.name}</span>
                        {routine.isActive && (
                          <Badge className="bg-green-100 text-green-800 border-green-200">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Active
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription>{routine.description}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(routine.createdAt)}</span>
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center p-3 bg-accent/50 rounded-lg">
                    <Sun className="w-6 h-6 text-primary mx-auto mb-1" />
                    <div className="text-sm font-medium">Morning</div>
                    <div className="text-xs text-muted-foreground">{routine.estimatedTime.morning}</div>
                  </div>
                  <div className="text-center p-3 bg-accent/50 rounded-lg">
                    <Moon className="w-6 h-6 text-primary mx-auto mb-1" />
                    <div className="text-sm font-medium">Evening</div>
                    <div className="text-xs text-muted-foreground">{routine.estimatedTime.evening}</div>
                  </div>
                  <div className="text-center p-3 bg-accent/50 rounded-lg">
                    <Droplets className="w-6 h-6 text-primary mx-auto mb-1" />
                    <div className="text-sm font-medium">Cost</div>
                    <div className="text-xs text-muted-foreground">${routine.totalCost}</div>
                  </div>
                  <div className="text-center p-3 bg-accent/50 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-primary mx-auto mb-1" />
                    <div className="text-sm font-medium">Effectiveness</div>
                    <div className="text-xs text-muted-foreground">{routine.effectiveness}%</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">{routine.skinType}</Badge>
                    {routine.concerns.map((concern: string, index: number) => (
                      <Badge key={index} variant="outline">{concern}</Badge>
                    ))}
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                    {!routine.isActive && (
                      <Button 
                        size="sm"
                        onClick={() => handleActivateRoutine(routine.id)}
                        disabled={activating === routine.id}
                        className="bg-gradient-primary"
                      >
                        {activating === routine.id ? 'Activating...' : 'Activate'}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedRoutinesDisplay;

