WorkCenterInfo = React.createClass({

  getInfoDivPos : function() {
    var pos_x = this.props.pos_x;
    var pos_y = this.props.pos_y;
    var dashboard_div = document.getElementById('application-content');

    if ((this.props.pos_x + 100) < (dashboard_div.offsetWidth - 260)) {
      pos_x = this.props.pos_x + 100
    }
    else{
      pos_x = this.props.pos_x - 260
    }

    if ((this.props.pos_y + 420) > dashboard_div.offsetHeight) {
      pos_y = dashboard_div.offsetHeight - 420
    }

    return [pos_x, pos_y]
  },

  render : function(){
    var pos = this.getInfoDivPos();
    var checkValue = function(value){
      if (value){
       return value
      }
      else{
        return " "
      }
    };
    var getStatusInChinese = function(value){
      switch (value){
        case "FAULT":
          return "故障"
        case "STOP":
          return "已停止"
        case "OFFLINE":
          return "離線"
        case "PAUSE":
          return "暫停"
        case "WORKING":
          return "工作中"
        case "START":
          return "已開始"
        case "ONLINE":
          return "在線"
        }
      return value;
    };
    return(
      <div className="WorkCenterInfoBox" style = {{"left": pos[0] + 'px',"top": pos[1] + 'px', "width": "260"}}>
        {this.props.info_stats.last_item ?
          <table>
            <tbody>
              <tr className="bg_dark"> <td className="wci_align_right">欄位名稱</td> <td>值</td> </tr>
              <tr className="bg_grey"> <td className="wci_align_right">狀態</td> <td> {getStatusInChinese(this.props.info_stats.last_item.currentStatus)} </td> </tr>
              <tr> <td className="wci_align_right">工作中心</td> <td> {checkValue(this.props.info_stats.last_item.workcenterName)} </td> </tr>
              <tr className="bg_grey"> <td className="wci_align_right">機器名稱</td> <td> {checkValue(this.props.info_stats.last_item.machineName)} </td> </tr>
              <tr> <td className="wci_align_right">工作單</td><td>  {checkValue(this.props.info_stats.last_item.workorderNo)} </td> </tr>
              <tr className="bg_grey"> <td className="wci_align_right">工序號</td> <td> {checkValue(this.props.info_stats.last_item.sequenceNo)} </td> </tr>
              <tr> <td className="wci_align_right">物料編碼</td> <td> {checkValue(this.props.info_stats.last_item.partno)}</td> </tr>
              <tr className="bg_grey"> <td className="wci_align_right">物料名稱</td> <td> {checkValue(this.props.info_stats.last_item.partnoName)}</td> </tr>
              <tr> <td className="wci_align_right">設備編號</td> <td> {checkValue(this.props.info_stats.last_item.deviceNo)} </td> </tr>
              <tr className="bg_grey"> <td className="wci_align_right">開始時間</td> <td> {moment(this.props.info_stats.last_item.startTime).format("MMM Do h:mm:s")} </td> </tr>
              <tr> <td className="wci_align_right">最後生產時間</td> <td> {moment(this.props.info_stats.last_item.recordTime).format("MMM Do h:mm:s")} </td> </tr>
              <tr className="bg_grey"> <td className="wci_align_right">不良數</td> <td> {checkValue(this.props.info_stats.NGCount)} </td> </tr>
              <tr> <td className="wci_align_right">累計生產數</td> <td> {checkValue(this.props.info_stats.accumulativeCount)} </td> </tr>
              <tr className="bg_grey"> <td className="wci_align_right">平均輸出(小時)</td> <td> {checkValue(this.props.info_stats.avg_output)} </td> </tr>
              <tr> <td className="wci_align_right">標準輸出(小時):</td> <td> {checkValue(this.props.info_stats.standard_work_time)} </td> </tr>
              <tr className="bg_grey"> <td className="wci_align_right">當前效率</td> <td> {checkValue(this.props.info_stats.currentEfficiency)} </td> </tr>
              <tr> <td className="wci_align_right">當天效率</td> <td> {checkValue(this.props.info_stats.todayEfficiency)} </td> </tr>
              <tr className="bg_grey"> <td className="wci_align_right">當前品質達標率</td> <td> {checkValue(this.props.info_stats.currentQualityRate)} </td> </tr>
              <tr> <td className="wci_align_right">當天品質達標率</td> <td> {checkValue(this.props.info_stats.todayQualityRate)} </td> </tr>
              <tr className="bg_grey"> <td className="wci_align_right">功能名称</td> <td> {checkValue(this.props.info_stats.last_item.functionName)} </td> </tr>
            </tbody>
          </table>
        :""}
      </div>
    )
  }
})
