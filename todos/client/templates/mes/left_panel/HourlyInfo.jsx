HourlyInfo = React.createClass({

  mixins: [ReactMeteorData],

  getMeteorData : function(){
    var dataRecords = DataRecord.find({workcenterCode:{$in:this.props.workcenterCodes},recordTime:{$gte:_DayStart(), $lte:_DayEnd() }}).fetch();
    var info = {};
    var accumulativeCount = 0;
    dataRecords.forEach(function(record){
      var time = record.recordTime;
      var hour = time.getHours().toString();
      if (record.count && record.machineFunction == "COUNT"){
        if (info[hour]) {
          info[hour] += record.count;
        }
        else {
          info[hour] = 1;
        }
        accumulativeCount += record.count;
      }  
    })
    return {
      dataRecords : dataRecords,
      info : info,
      accumulativeCount: accumulativeCount
    }
  },

  getHourlyInfoDivPos : function() {
    var pos_y = this.props.y;
    var left_nav_menu = document.getElementById('app-left-menu');
    if ((pos_y + 180) > left_nav_menu.offsetHeight) {
      pos_y = pos_y - 180;
    }
    return pos_y
  },

  closePopUp : function(){
    ReactiveHourlyFieldsVisibleBoxId.set(Random.id())
  },

  componentDidMount() {
      $('body').on('click', this.onBodyClick);
  },

  componentWillUnmount() {
      $('body').off('click', this.onBodyClick);
  },

  onBodyClick(event) {
      var trigger = this.refs.trigger;
      var overlayElem = ReactDOM.findDOMNode(this.refs.overlay);
      var isTargetInOverlay = $(event.target).closest(overlayElem).length > 0;
      if (!isTargetInOverlay) {
          ReactiveHourlyFieldsVisibleBoxId.set(Random.id())
      }
  },

  createMatrix : function (rows, columns)  {
    this.rows = rows;
    this.columns = columns;
    this.myarray = new Array(this.rows);
    for (var i=0; i < this.columns; i +=1) {
        this.myarray[i]=new Array(this.rows)
    }
    return this.myarray;
  },

  plotInfo : function(){
    var info = this.data.info
    var all_keys = Object.keys(info)
    var hour_details = []
    var three_info = []
    var count = 0;
    var final_info = this.createMatrix(2,2);
    all_keys.map(function(key){
      var int_key = parseInt(key)
      final_info[count][0] = key +":00 -"+(int_key + 1).toString()+ ":00"+ " : "; 
      final_info[count][1] =  info[key].toString();
      count += 1
      if (count == 2){
        three_info.push(<tr key={Random.id()}> <td key={Random.id()}>{final_info[0][0]}<b>{final_info[0][1]}</b></td>  <td key={Random.id()}>{final_info[1][0]}<b>{final_info[1][1]}</b></td> </tr>);
        count = 0;
        final_info = this.createMatrix(2,2);  
      }
    }.bind(this));
    if(final_info[0][0]){
      three_info.push(<tr key={Random.id()}> <td key={Random.id()}>{final_info[0][0]}<b>{final_info[0][1]}</b></td></tr>);
    }
    return three_info
  },

  render : function(){
    var yaxis = this.getHourlyInfoDivPos();
    return(
      <div ref="overlay" style={{"top": yaxis + "px","left": this.props.x + "px"}} className="ShopFloorInfoBox z-depth-5">
        <div className="hourlyinfo_lft"> {this.props.levelName} </div>
        <a onClick={this.closePopUp} className="hourlyinfo_rgt"><font color="black">X</font></a>
        <div className="clr_div">
        <table className="striped centered z-depth-1">  
          <tbody>
            {this.plotInfo()}
          </tbody>
        </table>
        <p> 累计产量 : <b>{this.data.accumulativeCount}</b> </p>
        </div>
      </div>
    )
  }
})
