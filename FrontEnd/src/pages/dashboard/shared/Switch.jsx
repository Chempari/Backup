export function Switch({ isOn, onToggle, title }) {
  return (
    <button
      className={`dash-switch ${isOn ? 'on' : ''}`}
      onClick={onToggle}
      title={title}
    />
  );
}
