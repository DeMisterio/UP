export class GameRoom{
    constructor(RoomID, Players, Spectators, World, GameState, MaxPlayers, Ticks){
        this.RoomID = RoomID;
        this.Players = Players;
        this.Spectators = Spectators;
        this.World = World;
        this.GameState = GameState;
        this.MaxPlayers = MaxPlayers;
        this.Ticks = Ticks;
    }
    addPlayer(connection){
        //Adds the player to the Room
    }
    removePlayer(PlayerID){
        //removes players from a lobby
    }
    startGame(){
        if(this.Players.length == this.MaxPlayers){
            this.GameState = 'playing'
        }
    }
    update(data){
        //will update the data
    }
    




}