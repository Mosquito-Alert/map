export const updateData = (context, data) => {
  context.commit('updateDates', data.dates)
  context.commit('updateData', data.data)
}
