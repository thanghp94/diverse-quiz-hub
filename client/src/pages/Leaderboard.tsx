
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trophy, Medal, Award, Star } from "lucide-react";
import Header from "@/components/Header";

const Leaderboard = () => {
  const leaderboardData = [
    { rank: 1, name: "Sarah Chen", points: 2485, streak: 15, badges: 12, avatar: "SC" },
    { rank: 2, name: "Alex Johnson", points: 2340, streak: 12, badges: 10, avatar: "AJ" },
    { rank: 3, name: "Maria Rodriguez", points: 2195, streak: 8, badges: 9, avatar: "MR" },
    { rank: 4, name: "David Kim", points: 2050, streak: 6, badges: 8, avatar: "DK" },
    { rank: 5, name: "Emma Wilson", points: 1920, streak: 10, badges: 7, avatar: "EW" },
    { rank: 6, name: "James Brown", points: 1875, streak: 5, badges: 6, avatar: "JB" },
    { rank: 7, name: "Lisa Garcia", points: 1780, streak: 7, badges: 5, avatar: "LG" },
    { rank: 8, name: "Michael Davis", points: 1650, streak: 4, badges: 4, avatar: "MD" },
    { rank: 9, name: "Anna Taylor", points: 1520, streak: 3, badges: 3, avatar: "AT" },
    { rank: 10, name: "Ryan Martinez", points: 1400, streak: 2, badges: 2, avatar: "RM" }
  ];

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-400" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-300" />;
      case 3:
        return <Award className="h-6 w-6 text-amber-500" />;
      default:
        return <span className="text-lg font-bold text-gray-300">#{rank}</span>;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    if (rank <= 3) return "bg-gradient-to-r from-yellow-400 to-orange-500 text-white";
    if (rank <= 5) return "bg-gradient-to-r from-blue-400 to-blue-600 text-white";
    return "bg-white/10 text-white";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 text-white">
      <Header />
      <div className="container mx-auto p-4 md:p-8">
        
        <div className="text-center my-8">
          <div className="inline-flex items-center gap-3 mb-2">
            <Trophy className="h-10 w-10 text-yellow-400" />
            <h1 className="text-4xl font-bold">Leaderboard</h1>
          </div>
          <p className="text-white/80">Top performers in Meraki WSC</p>
        </div>

        {/* Top 3 Podium */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {leaderboardData.slice(0, 3).map((user, index) => (
            <Card key={user.rank} className={`${index === 0 ? 'md:order-2 transform md:scale-105' : index === 1 ? 'md:order-1' : 'md:order-3'} ${getRankBadgeColor(user.rank)} border-0 text-center shadow-lg`}>
              <CardHeader className="pb-2">
                <div className="flex justify-center mb-2">
                  {getRankIcon(user.rank)}
                </div>
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-2xl font-bold">{user.avatar}</span>
                </div>
                <CardTitle className="text-xl font-semibold">{user.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-3xl font-bold">{user.points.toLocaleString()}</div>
                  <div className="text-sm opacity-90">points</div>
                  <div className="flex justify-center gap-4 text-sm mt-2">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4" />
                      {user.streak} streak
                    </div>
                    <div className="flex items-center gap-1">
                      <Award className="h-4 w-4" />
                      {user.badges} badges
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Full Leaderboard Table */}
        <Card className="bg-white/10 backdrop-blur-lg border border-white/20">
          <CardHeader>
            <CardTitle>Complete Rankings</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-b-0 hover:bg-transparent">
                  <TableHead className="w-16 text-white/80">Rank</TableHead>
                  <TableHead className="text-white/80">Player</TableHead>
                  <TableHead className="text-right text-white/80">Points</TableHead>
                  <TableHead className="text-right text-white/80">Streak</TableHead>
                  <TableHead className="text-right text-white/80">Badges</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaderboardData.map((user) => (
                  <TableRow key={user.rank} className={`border-b border-white/10 last:border-b-0 ${user.rank <= 3 ? 'bg-white/5' : ''} hover:bg-white/20 transition-colors`}>
                    <TableCell className="font-medium">
                      <div className="flex items-center justify-center h-full">
                        {getRankIcon(user.rank)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-cyan-500/20 rounded-full flex items-center justify-center border border-cyan-400/30">
                          <span className="text-sm font-medium text-cyan-200">{user.avatar}</span>
                        </div>
                        <span className="font-medium">{user.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {user.points.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline" className="bg-orange-500/20 text-orange-300 border-orange-400/30 px-2 py-1">
                        {user.streak}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline" className="bg-purple-500/20 text-purple-300 border-purple-400/30 px-2 py-1">
                        {user.badges}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Leaderboard;
